from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from models import (
    Group, GroupMember, GroupHolding, Proposal, Vote,
    ProposalStatus, TradeAction, VoteChoice
)
from schemas import (
    GroupCreate, GroupJoin, GroupOut,
    ProposalCreate, ProposalOut, CastVote, VoteOut
)
from routers.stocks import format_ticker
from datetime import datetime, timedelta, timezone
import yfinance as yf
import random
import string
import uuid

router = APIRouter(prefix="/groups", tags=["groups"])


def generate_invite_code(length: int = 6) -> str:
    return "TL-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=length))


async def fetch_price(ticker: str) -> float:
    ns_ticker = format_ticker(ticker)
    hist      = yf.Ticker(ns_ticker).history(period="2d")
    if hist.empty:
        raise HTTPException(status_code=404, detail=f"Price not found for {ticker}")
    return float(hist["Close"].iloc[-1])


def initial_nav(corpus: float) -> float:
    """Starting NAV — ₹100 per unit."""
    return 100.0


def units_for_amount(amount: float, current_nav: float) -> float:
    return amount / current_nav


# ─── Create group ─────────────────────────────────────────────────────────────

@router.post("/create", response_model=GroupOut)
async def create_group(req: GroupCreate, db: AsyncSession = Depends(get_db)):
    invite_code = generate_invite_code()
    group = Group(
        id             = str(uuid.uuid4()),
        name           = req.name,
        invite_code    = invite_code,
        vote_mode      = req.vote_mode,
        virtual_corpus = req.initial_contribution,
        created_by     = req.created_by,
    )
    db.add(group)
    await db.flush()  # get group.id before adding member

    # Creator auto-joins with initial contribution
    nav     = initial_nav(req.initial_contribution)
    units   = units_for_amount(req.initial_contribution, nav)
    member  = GroupMember(
        id           = str(uuid.uuid4()),
        group_id     = group.id,
        user_id      = req.created_by,
        units_held   = units,
        contribution = req.initial_contribution,
    )
    db.add(member)
    await db.commit()
    await db.refresh(group)

    return GroupOut(
        id             = group.id,
        name           = group.name,
        invite_code    = group.invite_code,
        vote_mode      = group.vote_mode,
        virtual_corpus = group.virtual_corpus,
        member_count   = 1,
        created_at     = group.created_at,
    )


# ─── Join group ───────────────────────────────────────────────────────────────

@router.post("/join")
async def join_group(req: GroupJoin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Group).where(Group.invite_code == req.invite_code))
    group  = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Invalid invite code.")

    # Check already a member
    result = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group.id,
            GroupMember.user_id  == req.user_id,
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already a member of this group.")

    # Compute current NAV based on corpus / total units issued
    result      = await db.execute(
        select(func.sum(GroupMember.units_held)).where(GroupMember.group_id == group.id)
    )
    total_units = result.scalar() or 0
    current_nav = (group.virtual_corpus / total_units) if total_units > 0 else 100.0

    units = units_for_amount(req.contribution, current_nav)

    member = GroupMember(
        id           = str(uuid.uuid4()),
        group_id     = group.id,
        user_id      = req.user_id,
        units_held   = units,
        contribution = req.contribution,
    )
    group.virtual_corpus += req.contribution
    db.add(member)
    await db.commit()

    return {
        "message"      : f"Joined '{group.name}' successfully.",
        "units_issued" : round(units, 4),
        "current_nav"  : round(current_nav, 2),
        "group_id"     : group.id,
    }


# ─── Get group details ────────────────────────────────────────────────────────

@router.get("/{group_id}")
async def get_group(group_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Group).where(Group.id == group_id))
    group  = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    result  = await db.execute(
        select(GroupMember).where(GroupMember.group_id == group_id, GroupMember.is_active == True)
    )
    members = result.scalars().all()

    result   = await db.execute(
        select(GroupHolding).where(GroupHolding.group_id == group_id)
    )
    holdings = result.scalars().all()

    return {
        "id"             : group.id,
        "name"           : group.name,
        "invite_code"    : group.invite_code,
        "vote_mode"      : group.vote_mode,
        "virtual_corpus" : round(group.virtual_corpus, 2),
        "member_count"   : len(members),
        "members"        : [{"user_id": m.user_id, "units": round(m.units_held, 4),
                              "contribution": m.contribution} for m in members],
        "holdings"       : [{"ticker": h.ticker, "quantity": h.quantity,
                              "avg_buy_price": h.avg_buy_price} for h in holdings],
    }


# ─── Propose a trade ──────────────────────────────────────────────────────────

@router.post("/propose", response_model=ProposalOut)
async def propose_trade(req: ProposalCreate, db: AsyncSession = Depends(get_db)):
    # Verify group exists and proposer is a member
    result = await db.execute(select(Group).where(Group.id == req.group_id))
    group  = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    result = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == req.group_id,
            GroupMember.user_id  == req.proposed_by,
            GroupMember.is_active == True,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You must be a group member to propose trades.")

    price = await fetch_price(req.ticker)

    proposal = Proposal(
        id                = str(uuid.uuid4()),
        group_id          = req.group_id,
        proposed_by       = req.proposed_by,
        ticker            = req.ticker.upper(),
        action            = req.action,
        quantity          = req.quantity,
        price_at_proposal = price,
        rationale         = req.rationale,
        status            = ProposalStatus.open,
        expires_at        = datetime.now(timezone.utc) + timedelta(hours=24),
    )
    db.add(proposal)
    await db.commit()
    await db.refresh(proposal)

    # Get member count for response
    result       = await db.execute(
        select(func.count()).where(GroupMember.group_id == req.group_id, GroupMember.is_active == True)
    )
    member_count = result.scalar()

    return ProposalOut(
        id                = proposal.id,
        group_id          = proposal.group_id,
        proposed_by       = proposal.proposed_by,
        ticker            = proposal.ticker,
        action            = proposal.action.value,
        quantity          = proposal.quantity,
        price_at_proposal = proposal.price_at_proposal,
        rationale         = proposal.rationale,
        status            = proposal.status.value,
        expires_at        = proposal.expires_at,
        created_at        = proposal.created_at,
        yes_votes         = 0,
        no_votes          = 0,
        total_members     = member_count,
    )


# ─── Cast a vote ──────────────────────────────────────────────────────────────

@router.post("/vote", response_model=VoteOut)
async def cast_vote(req: CastVote, db: AsyncSession = Depends(get_db)):
    result   = await db.execute(select(Proposal).where(Proposal.id == req.proposal_id))
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found.")
    if proposal.status != ProposalStatus.open:
        raise HTTPException(status_code=400, detail=f"Proposal is already {proposal.status.value}.")
    if datetime.now(timezone.utc) > proposal.expires_at:
        proposal.status = ProposalStatus.expired
        await db.commit()
        raise HTTPException(status_code=400, detail="Proposal has expired.")

    # Prevent duplicate votes
    result = await db.execute(
        select(Vote).where(Vote.proposal_id == req.proposal_id, Vote.voter_id == req.voter_id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You have already voted on this proposal.")

    vote = Vote(
        id          = str(uuid.uuid4()),
        proposal_id = req.proposal_id,
        voter_id    = req.voter_id,
        vote        = req.vote,
    )
    db.add(vote)
    await db.flush()

    # ── Check if proposal should execute ──────────────────────────────────────
    result    = await db.execute(
        select(func.count()).where(Vote.proposal_id == req.proposal_id,
                                   Vote.vote.in_([VoteChoice.yes, VoteChoice.disagree_but_allow]))
    )
    yes_count = result.scalar()

    result   = await db.execute(
        select(func.count()).where(Vote.proposal_id == req.proposal_id, Vote.vote == VoteChoice.no)
    )
    no_count = result.scalar()

    result       = await db.execute(
        select(func.count()).where(GroupMember.group_id == proposal.group_id,
                                   GroupMember.is_active == True)
    )
    member_count = result.scalar()

    result = await db.execute(select(Group).where(Group.id == proposal.group_id))
    group  = result.scalar_one_or_none()

    new_status = proposal.status

    if group.vote_mode == "majority":
        majority_needed = (member_count // 2) + 1
        if yes_count >= majority_needed:
            new_status = ProposalStatus.executed
            await _execute_group_trade(proposal, group, db)
        elif no_count >= majority_needed:
            new_status = ProposalStatus.rejected

    elif group.vote_mode == "unanimous":
        if yes_count == member_count:
            new_status = ProposalStatus.executed
            await _execute_group_trade(proposal, group, db)
        elif no_count >= 1:
            new_status = ProposalStatus.rejected

    proposal.status = new_status
    await db.commit()

    return VoteOut(
        proposal_id     = req.proposal_id,
        voter_id        = req.voter_id,
        vote            = req.vote.value,
        voted_at        = vote.voted_at,
        proposal_status = new_status.value,
    )


async def _execute_group_trade(proposal: Proposal, group: Group, db: AsyncSession):
    """Execute the approved trade against the group portfolio."""
    price       = await fetch_price(proposal.ticker)
    total_cost  = price * proposal.quantity

    if proposal.action == TradeAction.BUY:
        if group.virtual_corpus < total_cost:
            proposal.status = ProposalStatus.rejected
            return

        group.virtual_corpus -= total_cost

        result  = await db.execute(
            select(GroupHolding).where(
                GroupHolding.group_id == group.id,
                GroupHolding.ticker  == proposal.ticker,
            )
        )
        holding = result.scalar_one_or_none()
        if holding:
            old_total        = holding.quantity * holding.avg_buy_price
            new_total        = proposal.quantity * price
            holding.quantity += proposal.quantity
            holding.avg_buy_price = (old_total + new_total) / holding.quantity
        else:
            holding = GroupHolding(
                id            = str(uuid.uuid4()),
                group_id      = group.id,
                ticker        = proposal.ticker,
                quantity      = proposal.quantity,
                avg_buy_price = price,
            )
            db.add(holding)

    elif proposal.action == TradeAction.SELL:
        result  = await db.execute(
            select(GroupHolding).where(
                GroupHolding.group_id == group.id,
                GroupHolding.ticker  == proposal.ticker,
            )
        )
        holding = result.scalar_one_or_none()
        if not holding or holding.quantity < proposal.quantity:
            proposal.status = ProposalStatus.rejected
            return

        group.virtual_corpus += total_cost
        if holding.quantity == proposal.quantity:
            await db.delete(holding)
        else:
            holding.quantity -= proposal.quantity


# ─── List open proposals for a group ─────────────────────────────────────────

@router.get("/{group_id}/proposals")
async def list_proposals(group_id: str, db: AsyncSession = Depends(get_db)):
    result    = await db.execute(
        select(Proposal)
        .where(Proposal.group_id == group_id)
        .order_by(Proposal.created_at.desc())
        .limit(20)
    )
    proposals = result.scalars().all()

    member_count_result = await db.execute(
        select(func.count()).where(GroupMember.group_id == group_id, GroupMember.is_active == True)
    )
    member_count = member_count_result.scalar()

    out = []
    for p in proposals:
        yes_result = await db.execute(
            select(func.count()).where(Vote.proposal_id == p.id,
                                       Vote.vote.in_([VoteChoice.yes, VoteChoice.disagree_but_allow]))
        )
        no_result = await db.execute(
            select(func.count()).where(Vote.proposal_id == p.id, Vote.vote == VoteChoice.no)
        )
        out.append({
            "id"              : p.id,
            "ticker"          : p.ticker,
            "action"          : p.action.value,
            "quantity"        : p.quantity,
            "price_at_proposal": p.price_at_proposal,
            "rationale"       : p.rationale,
            "proposed_by"     : p.proposed_by,
            "status"          : p.status.value,
            "expires_at"      : p.expires_at,
            "yes_votes"       : yes_result.scalar(),
            "no_votes"        : no_result.scalar(),
            "total_members"   : member_count,
        })
    return out
