from pydantic import BaseModel, field_validator, model_validator
from typing import List, Optional, Any, Literal
from datetime import datetime
import math

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
    # NOTE: userId is intentionally absent — the authenticated user_id is
    # derived server-side from the verified Firebase token.
    ticker: str
    quantity: float
    action: Literal["BUY", "SELL"]

    @field_validator("ticker")
    @classmethod
    def validate_ticker(cls, v: str) -> str:
        v = v.strip().upper()
        if not v:
            raise ValueError("ticker must not be empty")
        if len(v) > 20:
            raise ValueError("ticker must be 20 characters or fewer")
        return v

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v: float) -> float:
        if not math.isfinite(v):
            raise ValueError("quantity must be a finite number")
        if v <= 0:
            raise ValueError("quantity must be greater than 0")
        return v

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

class PortfolioResetResponse(BaseModel):
    user_id: str
    virtual_cash: float
    message: str

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

# Autopsy & AI Analysis
class AutopsyRequest(BaseModel):
    ticker: str
    action: str
    entry_price: float
    current_price: float
    quantity: float
    rsi: float
    volume_trend: str

class TradeAnalysisRequest(BaseModel):
    ticker: str
    name: Optional[str] = None
    price: float
    action: str
    quantity: float
    total_value: float

class TradeAnalysisResponse(BaseModel):
    analysis: str
    flags: str
