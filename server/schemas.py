from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

# Users
class UserSyncRequest(BaseModel):
    email: str
    name: str

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    college: Optional[str] = None
    profile_photo: Optional[str] = None

# Stocks
class StockQuote(BaseModel):
    ticker: str
    name: str
    price: float
    change: float
    change_pct: float
    volume: float
    rsi: Optional[float] = None
    volumeTrend: Optional[str] = None
    high_52w: Optional[float] = None
    low_52w: Optional[float] = None

class StockListResponse(BaseModel):
    ticker: str
    name: str
    price: float
    change: float
    trend: List[float]

# Portfolio
class TradeRequest(BaseModel):
    userId: str
    ticker: str
    quantity: float
    action: str

class HoldingSchema(BaseModel):
    ticker: str
    quantity: float
    avg_buy_price: float
    current_price: float
    pnl: float
    pnl_pct: float

class PortfolioSummaryResponse(BaseModel):
    user_id: str
    virtual_cash: float
    holdings: List[HoldingSchema]
    total_invested: float
    total_current_value: float
    total_pnl: float
    total_pnl_pct: float

# Groups
class GroupCreateRequest(BaseModel):
    name: str
    created_by: str
    initial_contribution: float
    vote_mode: Optional[str] = "majority"

class VoteRequest(BaseModel):
    proposal_id: str
    voter_id: str
    vote: str

# Autopsy
class AutopsyRequest(BaseModel):
    ticker: str
    action: str
    entry_price: float
    current_price: float
    quantity: float
    rsi: float
    volume_trend: str
