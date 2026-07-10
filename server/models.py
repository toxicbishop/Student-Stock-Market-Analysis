from sqlalchemy import Boolean, Column, Float, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    profile_photo = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    college = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="user", uselist=False)
    group_memberships = relationship("GroupMember", back_populates="user")
    votes = relationship("Vote", back_populates="voter")


class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    virtual_cash = Column(Float, default=10000.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="portfolio")
    holdings = relationship("Holding", back_populates="portfolio")
    trades = relationship("Trade", back_populates="portfolio")


class Holding(Base):
    __tablename__ = "holdings"

    id = Column(String, primary_key=True, default=generate_uuid)
    portfolio_id = Column(String, ForeignKey("portfolios.id"), nullable=False)
    ticker = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    avg_buy_price = Column(Float, nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="holdings")


class Trade(Base):
    __tablename__ = "trades"

    id = Column(String, primary_key=True, default=generate_uuid)
    portfolio_id = Column(String, ForeignKey("portfolios.id"), nullable=False)
    ticker = Column(String, nullable=False)
    action = Column(String, nullable=False) # 'BUY' or 'SELL'
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    total_value = Column(Float, nullable=False)
    rsi_at_trade = Column(Float, nullable=True)
    volume_trend = Column(String, nullable=True)
    ai_analysis = Column(String, nullable=True)
    mistake_flags = Column(String, nullable=True)
    executed_at = Column(DateTime, default=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="trades")


class Group(Base):
    __tablename__ = "groups"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    invite_code = Column(String, unique=True, nullable=False)
    vote_mode = Column(String, default="majority")
    virtual_corpus = Column(Float, default=30000.0)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("GroupMember", back_populates="group")
    proposals = relationship("Proposal", back_populates="group")
    holdings = relationship("GroupHolding", back_populates="group")


class GroupMember(Base):
    __tablename__ = "group_members"

    id = Column(String, primary_key=True, default=generate_uuid)
    group_id = Column(String, ForeignKey("groups.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    units_held = Column(Float, default=0.0)
    contribution = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    joined_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="group_memberships")


class GroupHolding(Base):
    __tablename__ = "group_holdings"

    id = Column(String, primary_key=True, default=generate_uuid)
    group_id = Column(String, ForeignKey("groups.id"), nullable=False)
    ticker = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    avg_buy_price = Column(Float, nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    group = relationship("Group", back_populates="holdings")


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(String, primary_key=True, default=generate_uuid)
    group_id = Column(String, ForeignKey("groups.id"), nullable=False)
    proposed_by = Column(String, ForeignKey("users.id"), nullable=False)
    ticker = Column(String, nullable=False)
    action = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    price_at_proposal = Column(Float, nullable=False)
    rationale = Column(String, nullable=True)
    status = Column(String, default="open") # open, executed, rejected, expired
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("Group", back_populates="proposals")
    votes = relationship("Vote", back_populates="proposal")


class Vote(Base):
    __tablename__ = "votes"

    id = Column(String, primary_key=True, default=generate_uuid)
    proposal_id = Column(String, ForeignKey("proposals.id"), nullable=False)
    voter_id = Column(String, ForeignKey("users.id"), nullable=False)
    vote = Column(String, nullable=False) # yes, no, abstain, disagree_but_allow
    voted_at = Column(DateTime, default=datetime.utcnow)

    proposal = relationship("Proposal", back_populates="votes")
    voter = relationship("User", back_populates="votes")
