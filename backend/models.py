from sqlalchemy import (
    Column, String, Float, Integer, Boolean,
    ForeignKey, DateTime, Enum, Text, func
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid
import enum


def gen_uuid():
    return str(uuid.uuid4())


class VoteChoice(str, enum.Enum):
    yes = "yes"
    no = "no"
    abstain = "abstain"
    disagree_but_allow = "disagree_but_allow"


class ProposalStatus(str, enum.Enum):
    open = "open"
    executed = "executed"
    rejected = "rejected"
    expired = "expired"


class TradeAction(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"


# ─── Users ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id          = Column(String, primary_key=True, default=gen_uuid)
    name        = Column(String, nullable=False)
    email       = Column(String, unique=True, nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    portfolio   = relationship("Portfolio", back_populates="user", uselist=False)
    group_memberships = relationship("GroupMember", back_populates="user")
    votes       = relationship("Vote", back_populates="voter")


# ─── Individual Portfolio ──────────────────────────────────────────────────────

class Portfolio(Base):
    __tablename__ = "portfolios"

    id            = Column(String, primary_key=True, default=gen_uuid)
    user_id       = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    virtual_cash  = Column(Float, default=10000.0)   # ₹10,000 student budget
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    user          = relationship("User", back_populates="portfolio")
    holdings      = relationship("Holding", back_populates="portfolio")
    trades        = relationship("Trade", back_populates="portfolio")


class Holding(Base):
    __tablename__ = "holdings"

    id            = Column(String, primary_key=True, default=gen_uuid)
    portfolio_id  = Column(String, ForeignKey("portfolios.id"), nullable=False)
    ticker        = Column(String, nullable=False)
    quantity      = Column(Float, nullable=False)
    avg_buy_price = Column(Float, nullable=False)
    last_updated  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    portfolio     = relationship("Portfolio", back_populates="holdings")


class Trade(Base):
    __tablename__ = "trades"

    id            = Column(String, primary_key=True, default=gen_uuid)
    portfolio_id  = Column(String, ForeignKey("portfolios.id"), nullable=False)
    ticker        = Column(String, nullable=False)
    action        = Column(Enum(TradeAction), nullable=False)
    quantity      = Column(Float, nullable=False)
    price         = Column(Float, nullable=False)
    total_value   = Column(Float, nullable=False)

    # AI Autopsy output
    rsi_at_trade  = Column(Float, nullable=True)
    volume_trend  = Column(String, nullable=True)
    ai_analysis   = Column(Text, nullable=True)
    mistake_flags = Column(Text, nullable=True)   # JSON string

    executed_at   = Column(DateTime(timezone=True), server_default=func.now())

    portfolio     = relationship("Portfolio", back_populates="trades")


# ─── Group Investing ───────────────────────────────────────────────────────────

class Group(Base):
    __tablename__ = "groups"

    id            = Column(String, primary_key=True, default=gen_uuid)
    name          = Column(String, nullable=False)
    invite_code   = Column(String, unique=True, nullable=False)
    # majority | unanimous
    vote_mode     = Column(String, default="majority")
    virtual_corpus = Column(Float, default=30000.0)  # ₹30K shared pool
    created_by    = Column(String, ForeignKey("users.id"), nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    members       = relationship("GroupMember", back_populates="group")
    proposals     = relationship("Proposal", back_populates="group")
    holdings      = relationship("GroupHolding", back_populates="group")


class GroupMember(Base):
    __tablename__ = "group_members"

    id              = Column(String, primary_key=True, default=gen_uuid)
    group_id        = Column(String, ForeignKey("groups.id"), nullable=False)
    user_id         = Column(String, ForeignKey("users.id"), nullable=False)
    units_held      = Column(Float, default=0.0)       # NAV-based units
    contribution    = Column(Float, default=0.0)       # ₹ contributed
    is_active       = Column(Boolean, default=True)
    joined_at       = Column(DateTime(timezone=True), server_default=func.now())

    group           = relationship("Group", back_populates="members")
    user            = relationship("User", back_populates="group_memberships")


class GroupHolding(Base):
    __tablename__ = "group_holdings"

    id            = Column(String, primary_key=True, default=gen_uuid)
    group_id      = Column(String, ForeignKey("groups.id"), nullable=False)
    ticker        = Column(String, nullable=False)
    quantity      = Column(Float, nullable=False)
    avg_buy_price = Column(Float, nullable=False)
    last_updated  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    group         = relationship("Group", back_populates="holdings")


class Proposal(Base):
    __tablename__ = "proposals"

    id              = Column(String, primary_key=True, default=gen_uuid)
    group_id        = Column(String, ForeignKey("groups.id"), nullable=False)
    proposed_by     = Column(String, ForeignKey("users.id"), nullable=False)
    ticker          = Column(String, nullable=False)
    action          = Column(Enum(TradeAction), nullable=False)
    quantity        = Column(Float, nullable=False)
    price_at_proposal = Column(Float, nullable=False)
    rationale       = Column(Text, nullable=True)
    status          = Column(Enum(ProposalStatus), default=ProposalStatus.open)
    expires_at      = Column(DateTime(timezone=True), nullable=False)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    group           = relationship("Group", back_populates="proposals")
    votes           = relationship("Vote", back_populates="proposal")


class Vote(Base):
    __tablename__ = "votes"

    id          = Column(String, primary_key=True, default=gen_uuid)
    proposal_id = Column(String, ForeignKey("proposals.id"), nullable=False)
    voter_id    = Column(String, ForeignKey("users.id"), nullable=False)
    vote        = Column(Enum(VoteChoice), nullable=False)
    voted_at    = Column(DateTime(timezone=True), server_default=func.now())

    proposal    = relationship("Proposal", back_populates="votes")
    voter       = relationship("User", back_populates="votes")
