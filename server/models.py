from sqlalchemy import Boolean, Column, Float, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship, Mapped
from datetime import datetime
import uuid
import enum

from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = Column(String, primary_key=True, default=generate_uuid)
    name: Mapped[str] = Column(String, nullable=False)
    email: Mapped[str] = Column(String, unique=True, nullable=False)
    hashed_password: Mapped[str] = Column(String, nullable=False)
    profile_photo: Mapped[str] = Column(String, nullable=True)
    bio: Mapped[str] = Column(String, nullable=True)
    college: Mapped[str] = Column(String, nullable=True)
    created_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="user", uselist=False)
    group_memberships = relationship("GroupMember", back_populates="user")
    votes = relationship("Vote", back_populates="voter")


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[str] = Column(String, primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    virtual_cash: Mapped[float] = Column(Float, default=10000.0)
    created_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="portfolio")
    holdings = relationship("Holding", back_populates="portfolio")
    trades = relationship("Trade", back_populates="portfolio")


class Holding(Base):
    __tablename__ = "holdings"

    id: Mapped[str] = Column(String, primary_key=True, default=generate_uuid)
    portfolio_id: Mapped[str] = Column(String, ForeignKey("portfolios.id"), nullable=False)
    ticker: Mapped[str] = Column(String, nullable=False)
    quantity: Mapped[float] = Column(Float, nullable=False)
    avg_buy_price: Mapped[float] = Column(Float, nullable=False)
    last_updated: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="holdings")


class Trade(Base):
    __tablename__ = "trades"

    id: Mapped[str] = Column(String, primary_key=True, default=generate_uuid)
    portfolio_id: Mapped[str] = Column(String, ForeignKey("portfolios.id"), nullable=False)
    ticker: Mapped[str] = Column(String, nullable=False)
    action: Mapped[str] = Column(String, nullable=False) # 'BUY' or 'SELL'
    quantity: Mapped[float] = Column(Float, nullable=False)
    price: Mapped[float] = Column(Float, nullable=False)
    total_value: Mapped[float] = Column(Float, nullable=False)
    rsi_at_trade: Mapped[float] = Column(Float, nullable=True)
    volume_trend: Mapped[str] = Column(String, nullable=True)
    ai_analysis: Mapped[str] = Column(String, nullable=True)
    mistake_flags: Mapped[str] = Column(String, nullable=True)
    executed_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="trades")


class Group(Base):
    __tablename__ = "groups"

    id: Mapped[str] = Column(String, primary_key=True, default=generate_uuid)
    name: Mapped[str] = Column(String, nullable=False)
    invite_code: Mapped[str] = Column(String, unique=True, nullable=False)
    vote_mode: Mapped[str] = Column(String, default="majority")
    virtual_corpus: Mapped[float] = Column(Float, default=30000.0)
    created_by: Mapped[str] = Column(String, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow)

    members = relationship("GroupMember", back_populates="group")
    proposals = relationship("Proposal", back_populates="group")
    holdings = relationship("GroupHolding", back_populates="group")


class GroupMember(Base):
    __tablename__ = "group_members"

    id: Mapped[str] = Column(String, primary_key=True, default=generate_uuid)
    group_id: Mapped[str] = Column(String, ForeignKey("groups.id"), nullable=False)
    user_id: Mapped[str] = Column(String, ForeignKey("users.id"), nullable=False)
    units_held: Mapped[float] = Column(Float, default=0.0)
    contribution: Mapped[float] = Column(Float, default=0.0)
    is_active: Mapped[bool] = Column(Boolean, default=True)
    joined_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow)

    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="group_memberships")


class GroupHolding(Base):
    __tablename__ = "group_holdings"

    id: Mapped[str] = Column(String, primary_key=True, default=generate_uuid)
    group_id: Mapped[str] = Column(String, ForeignKey("groups.id"), nullable=False)
    ticker: Mapped[str] = Column(String, nullable=False)
    quantity: Mapped[float] = Column(Float, nullable=False)
    avg_buy_price: Mapped[float] = Column(Float, nullable=False)
    last_updated: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    group = relationship("Group", back_populates="holdings")


class Proposal(Base):
    __tablename__ = "proposals"

    id: Mapped[str] = Column(String, primary_key=True, default=generate_uuid)
    group_id: Mapped[str] = Column(String, ForeignKey("groups.id"), nullable=False)
    proposed_by: Mapped[str] = Column(String, ForeignKey("users.id"), nullable=False)
    ticker: Mapped[str] = Column(String, nullable=False)
    action: Mapped[str] = Column(String, nullable=False)
    quantity: Mapped[float] = Column(Float, nullable=False)
    price_at_proposal: Mapped[float] = Column(Float, nullable=False)
    rationale: Mapped[str] = Column(String, nullable=True)
    status: Mapped[str] = Column(String, default="open") # open, executed, rejected, expired
    expires_at: Mapped[datetime] = Column(DateTime, nullable=False)
    created_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow)

    group = relationship("Group", back_populates="proposals")
    votes = relationship("Vote", back_populates="proposal")


class Vote(Base):
    __tablename__ = "votes"

    id: Mapped[str] = Column(String, primary_key=True, default=generate_uuid)
    proposal_id: Mapped[str] = Column(String, ForeignKey("proposals.id"), nullable=False)
    voter_id: Mapped[str] = Column(String, ForeignKey("users.id"), nullable=False)
    vote: Mapped[str] = Column(String, nullable=False) # yes, no, abstain, disagree_but_allow
    voted_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow)

    proposal = relationship("Proposal", back_populates="votes")
    voter = relationship("User", back_populates="votes")
