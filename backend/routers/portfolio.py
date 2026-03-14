from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import Portfolio, Holding, Trade, User, TradeAction
from schemas import BuyRequest, SellRequest, PortfolioOut, HoldingOut, TradeOut
from routers.stocks import format_ticker
from analyzer import TradeAnalyzer
import yfinance as yf
import json
import uuid

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


async def fetch_current_price(ticker: str) -> float:
    ns_ticker = format_ticker(ticker)
    stock     = yf.Ticker(ns_ticker)
    hist      = stock.history(period="2d")
    if hist.empty:
        raise HTTPException(status_code=404, detail=f"Price not found for {ticker}")
    return float(hist["Close"].iloc[-1])


async def fetch_rsi_and_volume(ticker: str):
    """Returns (rsi, volume_trend) tuple for post-trade autopsy."""
    from routers.stocks import compute_rsi, get_volume_trend
    ns_ticker = format_ticker(ticker)
    hist      = yf.Ticker(ns_ticker).history(period="3mo")
    if hist.empty:
        return None, None
    return compute_rsi(hist["Close"]), get_volume_trend(hist)


def compute_mistake_flags(
    entry_price: float, current_price: float,
    rsi: float | None, volume_trend: str | None,
) -> str:
    if rsi is None:
        return json.dumps([])
    analyzer = TradeAnalyzer(entry_price, current_price, rsi, volume_trend or "unknown")
    flag     = analyzer.analyze_loss()
    return json.dumps([flag.model_dump()])


# ─── Create portfolio (called on user registration) ───────────────────────────

@router.post("/create/{user_id}")
async def create_portfolio(user_id: str, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Portfolio).where(Portfolio.user_id == user_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Portfolio already exists")
    portfolio = Portfolio(id=str(uuid.uuid4()), user_id=user_id, virtual_cash=10000.0)
    db.add(portfolio)
    await db.commit()
    return {"message": "Portfolio created", "virtual_cash": 10000.0}


# ─── Get portfolio summary ────────────────────────────────────────────────────

@router.get("/{user_id}", response_model=PortfolioOut)
async def get_portfolio(user_id: str, db: AsyncSession = Depends(get_db)):
    result    = await db.execute(select(Portfolio).where(Portfolio.user_id == user_id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    result   = await db.execute(select(Holding).where(Holding.portfolio_id == portfolio.id))
    holdings = result.scalars().all()

    holdings_out      = []
    total_invested    = 0.0
    total_current_val = 0.0

    for h in holdings:
        try:
            cur_price = await fetch_current_price(h.ticker)
        except Exception:
            cur_price = h.avg_buy_price

        invested    = h.quantity * h.avg_buy_price
        current_val = h.quantity * cur_price
        pnl         = current_val - invested
        pnl_pct     = (pnl / invested * 100) if invested else 0

        total_invested    += invested
        total_current_val += current_val

        holdings_out.append(HoldingOut(
            ticker        = h.ticker,
            quantity      = h.quantity,
            avg_buy_price = h.avg_buy_price,
            current_price = round(cur_price, 2),
            pnl           = round(pnl, 2),
            pnl_pct       = round(pnl_pct, 2),
        ))

    total_pnl     = total_current_val - total_invested
    total_pnl_pct = (total_pnl / total_invested * 100) if total_invested else 0

    return PortfolioOut(
        user_id            = user_id,
        virtual_cash       = round(portfolio.virtual_cash, 2),
        holdings           = holdings_out,
        total_invested     = round(total_invested, 2),
        total_current_value= round(total_current_val, 2),
        total_pnl          = round(total_pnl, 2),
        total_pnl_pct      = round(total_pnl_pct, 2),
    )


# ─── Buy ──────────────────────────────────────────────────────────────────────

@router.post("/buy", response_model=TradeOut)
async def buy_stock(req: BuyRequest, db: AsyncSession = Depends(get_db)):
    result    = await db.execute(select(Portfolio).where(Portfolio.user_id == req.user_id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found. Create one first.")

    price       = await fetch_current_price(req.ticker)
    total_cost  = price * req.quantity

    if portfolio.virtual_cash < total_cost:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient virtual cash. You have ₹{portfolio.virtual_cash:.2f}, need ₹{total_cost:.2f}."
        )

    # Deduct cash
    portfolio.virtual_cash -= total_cost

    # Update or create holding
    result  = await db.execute(
        select(Holding).where(
            Holding.portfolio_id == portfolio.id,
            Holding.ticker       == req.ticker.upper()
        )
    )
    holding = result.scalar_one_or_none()

    if holding:
        # Update average buy price (weighted)
        old_total        = holding.quantity * holding.avg_buy_price
        new_total        = req.quantity * price
        holding.quantity += req.quantity
        holding.avg_buy_price = (old_total + new_total) / holding.quantity
    else:
        holding = Holding(
            id            = str(uuid.uuid4()),
            portfolio_id  = portfolio.id,
            ticker        = req.ticker.upper(),
            quantity      = req.quantity,
            avg_buy_price = price,
        )
        db.add(holding)

    # Fetch RSI + volume for autopsy
    rsi, volume_trend = await fetch_rsi_and_volume(req.ticker)
    mistake_flags     = compute_mistake_flags(price, price, rsi, volume_trend)

    # Record trade
    trade = Trade(
        id            = str(uuid.uuid4()),
        portfolio_id  = portfolio.id,
        ticker        = req.ticker.upper(),
        action        = TradeAction.BUY,
        quantity      = req.quantity,
        price         = price,
        total_value   = total_cost,
        rsi_at_trade  = rsi,
        volume_trend  = volume_trend,
        mistake_flags = mistake_flags,
    )
    db.add(trade)
    await db.commit()
    await db.refresh(trade)

    return trade


# ─── Sell ─────────────────────────────────────────────────────────────────────

@router.post("/sell", response_model=TradeOut)
async def sell_stock(req: SellRequest, db: AsyncSession = Depends(get_db)):
    result    = await db.execute(select(Portfolio).where(Portfolio.user_id == req.user_id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")

    result  = await db.execute(
        select(Holding).where(
            Holding.portfolio_id == portfolio.id,
            Holding.ticker       == req.ticker.upper()
        )
    )
    holding = result.scalar_one_or_none()

    if not holding or holding.quantity < req.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"You don't hold enough {req.ticker} shares to sell."
        )

    price         = await fetch_current_price(req.ticker)
    total_value   = price * req.quantity

    # Credit cash
    portfolio.virtual_cash += total_value

    # Update holding
    if holding.quantity == req.quantity:
        await db.delete(holding)
    else:
        holding.quantity -= req.quantity

    # Fetch RSI for autopsy
    rsi, volume_trend = await fetch_rsi_and_volume(req.ticker)
    mistake_flags     = compute_mistake_flags(holding.avg_buy_price, price, rsi, volume_trend)

    trade = Trade(
        id            = str(uuid.uuid4()),
        portfolio_id  = portfolio.id,
        ticker        = req.ticker.upper(),
        action        = TradeAction.SELL,
        quantity      = req.quantity,
        price         = price,
        total_value   = total_value,
        rsi_at_trade  = rsi,
        volume_trend  = volume_trend,
        mistake_flags = mistake_flags,
    )
    db.add(trade)
    await db.commit()
    await db.refresh(trade)

    return trade


# ─── Trade history ────────────────────────────────────────────────────────────

@router.get("/{user_id}/trades")
async def get_trade_history(user_id: str, db: AsyncSession = Depends(get_db)):
    result    = await db.execute(select(Portfolio).where(Portfolio.user_id == user_id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")

    result = await db.execute(
        select(Trade)
        .where(Trade.portfolio_id == portfolio.id)
        .order_by(Trade.executed_at.desc())
        .limit(50)
    )
    return result.scalars().all()
