from fastapi import APIRouter, HTTPException, Query
from schemas import StockQuote
import yfinance as yf
import pandas as pd

router = APIRouter(prefix="/stocks", tags=["stocks"])


def compute_rsi(prices: pd.Series, period: int = 14) -> float:
    """Compute RSI using Wilder's smoothing method."""
    delta  = prices.diff()
    gain   = delta.clip(lower=0)
    loss   = -delta.clip(upper=0)
    avg_gain = gain.ewm(com=period - 1, min_periods=period).mean()
    avg_loss = loss.ewm(com=period - 1, min_periods=period).mean()
    rs     = avg_gain / avg_loss.replace(0, float("inf"))
    rsi    = 100 - (100 / (1 + rs))
    return round(float(rsi.iloc[-1]), 2)


def get_volume_trend(hist: pd.DataFrame) -> str:
    """Compare last 3-day avg volume vs 10-day avg volume."""
    if len(hist) < 10:
        return "unknown"
    recent_vol = hist["Volume"].iloc[-3:].mean()
    baseline   = hist["Volume"].iloc[-10:].mean()
    return "up" if recent_vol > baseline else "down"


def format_ticker(ticker: str) -> str:
    """Add .NS suffix for NSE stocks if not already present."""
    ticker = ticker.upper().strip()
    if not ticker.endswith(".NS") and not ticker.endswith(".BO"):
        return ticker + ".NS"
    return ticker


@router.get("/quote/{ticker}", response_model=StockQuote)
async def get_quote(ticker: str):
    """
    Fetch live quote + RSI + volume trend for a given NSE ticker.
    Example: GET /stocks/quote/RELIANCE  →  uses RELIANCE.NS internally
    """
    ns_ticker = format_ticker(ticker)
    try:
        stock = yf.Ticker(ns_ticker)
        info  = stock.info
        hist  = stock.history(period="3mo")

        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {ticker}")

        current_price = info.get("currentPrice") or hist["Close"].iloc[-1]
        prev_close    = info.get("previousClose") or hist["Close"].iloc[-2]
        change        = round(current_price - prev_close, 2)
        change_pct    = round((change / prev_close) * 100, 2)

        rsi           = compute_rsi(hist["Close"])
        volume_trend  = get_volume_trend(hist)

        return StockQuote(
            ticker       = ticker.upper(),
            name         = info.get("shortName", ticker.upper()),
            price        = round(current_price, 2),
            change       = change,
            change_pct   = change_pct,
            volume       = int(info.get("volume", hist["Volume"].iloc[-1])),
            rsi          = rsi,
            volume_trend = volume_trend,
            high_52w     = round(info.get("fiftyTwoWeekHigh", hist["High"].max()), 2),
            low_52w      = round(info.get("fiftyTwoWeekLow",  hist["Low"].min()),  2),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch {ticker}: {str(e)}")


@router.get("/search")
async def search_stocks(q: str = Query(..., min_length=1)):
    """
    Returns a curated list of popular NSE stocks matching the query.
    For demo purposes — replace with a proper NSE symbol API in production.
    """
    popular = [
        ("RELIANCE",  "Reliance Industries"),
        ("TCS",       "Tata Consultancy Services"),
        ("INFY",      "Infosys"),
        ("HDFCBANK",  "HDFC Bank"),
        ("WIPRO",     "Wipro"),
        ("TATAMOTORS","Tata Motors"),
        ("BAJFINANCE", "Bajaj Finance"),
        ("SBIN",      "State Bank of India"),
        ("ICICIBANK", "ICICI Bank"),
        ("AXISBANK",  "Axis Bank"),
        ("ADANIPORTS","Adani Ports"),
        ("MARUTI",    "Maruti Suzuki"),
        ("SUNPHARMA", "Sun Pharmaceutical"),
        ("TITAN",     "Titan Company"),
        ("HINDUNILVR","Hindustan Unilever"),
    ]
    q_upper = q.upper()
    results = [
        {"ticker": sym, "name": name}
        for sym, name in popular
        if q_upper in sym or q_upper in name.upper()
    ]
    return results[:8]


@router.get("/leaderboard-stocks")
async def leaderboard_stocks():
    """Top 5 most-traded stocks on TradeLab today (demo data)."""
    return [
        {"ticker": "RELIANCE",   "trades": 142, "change_pct": 1.2},
        {"ticker": "TCS",        "trades": 118, "change_pct": -0.5},
        {"ticker": "INFY",       "trades": 97,  "change_pct": 0.8},
        {"ticker": "BAJFINANCE", "trades": 84,  "change_pct": 2.1},
        {"ticker": "HDFCBANK",   "trades": 76,  "change_pct": -0.3},
    ]
