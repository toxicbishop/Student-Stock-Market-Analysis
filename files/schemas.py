from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from models import VoteChoice, ProposalStatus, TradeAction


# ─── User ─────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Stock ────────────────────────────────────────────────────────────────────

class StockQuote(BaseModel):
    ticker: str
    name: str
    price: float
    change: float
    change_pct: float
    volume: int
    rsi: Optional[float] = None
    volume_trend: Optional[str] = None   # 'up' | 'down'
    high_52w: float
    low_52w: float


# ─── Trade Autopsy ────────────────────────────────────────────────────────────

class AutopsyRequest(BaseModel):
    ticker: str
    action: TradeAction
    entry_price: float
    current_price: float
    rsi: float
    volume_trend: str   # 'up' | 'down'
    quantity: float


class MistakeFlag(BaseModel):
    flag: str
    severity: str   # 'warning' | 'critical'
    lesson: str
    fix: str


class AutopsyResponse(BaseModel):
    rule_based: MistakeFlag
    ai_explanation: str
    score: int   # 0-100 trade quality score


# ─── Portfolio ────────────────────────────────────────────────────────────────

class BuyRequest(BaseModel):
    user_id: str
    ticker: str
    quantity: float

    @field_validator("quantity")
    @classmethod
    def qty_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be positive")
        return v


class SellRequest(BaseModel):
    user_id: str
    ticker: str
    quantity: float


class HoldingOut(BaseModel):
    ticker: str
    quantity: float
    avg_buy_price: float
    current_price: Optional[float] = None
    pnl: Optional[float] = None
    pnl_pct: Optional[float] = None

    class Config:
        from_attributes = True


class PortfolioOut(BaseModel):
    user_id: str
    virtual_cash: float
    holdings: List[HoldingOut]
    total_invested: float
    total_current_value: float
    total_pnl: float
    total_pnl_pct: float


class TradeOut(BaseModel):
    id: str
    ticker: str
    action: str
    quantity: float
    price: float
    total_value: float
    ai_analysis: Optional[str]
    mistake_flags: Optional[str]
    executed_at: datetime

    class Config:
        from_attributes = True


# ─── Group ────────────────────────────────────────────────────────────────────

class GroupCreate(BaseModel):
    name: str
    created_by: str
    vote_mode: str = "majority"
    initial_contribution: float = 10000.0


class GroupJoin(BaseModel):
    user_id: str
    invite_code: str
    contribution: float = 10000.0


class GroupOut(BaseModel):
    id: str
    name: str
    invite_code: str
    vote_mode: str
    virtual_corpus: float
    member_count: int
    created_at: datetime


# ─── Proposal + Voting ────────────────────────────────────────────────────────

class ProposalCreate(BaseModel):
    group_id: str
    proposed_by: str
    ticker: str
    action: TradeAction
    quantity: float
    rationale: Optional[str] = None


class ProposalOut(BaseModel):
    id: str
    group_id: str
    proposed_by: str
    ticker: str
    action: str
    quantity: float
    price_at_proposal: float
    rationale: Optional[str]
    status: str
    expires_at: datetime
    created_at: datetime
    yes_votes: int
    no_votes: int
    total_members: int

    class Config:
        from_attributes = True


class CastVote(BaseModel):
    proposal_id: str
    voter_id: str
    vote: VoteChoice


class VoteOut(BaseModel):
    proposal_id: str
    voter_id: str
    vote: str
    voted_at: datetime
    proposal_status: str   # reflects new status after this vote

    class Config:
        from_attributes = True
