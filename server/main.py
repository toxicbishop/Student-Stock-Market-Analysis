from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import yfinance as yf
import requests
import json
import os
import random
import string
from datetime import datetime, timedelta
import google.generativeai as genai
from dotenv import load_dotenv

try:
    # Supports `uvicorn server.main:app` when launched from the repository root.
    from . import models, schemas, database, analyzer
    from .auth import get_current_user
except ImportError:
    # Supports `uvicorn main:app --reload` when launched inside server/.
    import models, schemas, database, analyzer
    from auth import get_current_user

load_dotenv(os.path.join(database.BASE_DIR, ".env"))

app = FastAPI()

models.Base.metadata.create_all(bind=database.engine)

api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("NEXT_PUBLIC_GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)


# ─────────────────────────────────────────────────────────────────────────────
# Stocks  (public — no auth required)
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/stocks", response_model=List[schemas.StockListResponse])
def get_stocks():
    tickers = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'BAJFINANCE.NS', 'HDFCBANK.NS', 'TATAMOTORS.NS']
    results = []
    
    # In a production app, we would fetch these asynchronously or cache them
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            hist = stock.history(period="1mo")
            if hist.empty:
                continue
            
            trend = hist['Close'].tail(10).tolist()
            
            results.append({
                "ticker": ticker.replace(".NS", ""),
                "name": info.get("shortName", ticker),
                "price": info.get("regularMarketPrice", info.get("currentPrice", 0.0)),
                "change": info.get("regularMarketChangePercent", 0.0),
                "trend": trend
            })
        except Exception as e:
            print(f"Failed to fetch {ticker}: {e}")
    return results

@app.get("/stocks/leaderboard-stocks")
def get_leaderboard_stocks():
    return [
        {"ticker": "RELIANCE", "trades": 142, "change_pct": 1.2},
        {"ticker": "TCS", "trades": 118, "change_pct": -0.5},
        {"ticker": "INFY", "trades": 97, "change_pct": 0.8},
        {"ticker": "BAJFINANCE", "trades": 84, "change_pct": 2.1},
        {"ticker": "HDFCBANK", "trades": 76, "change_pct": -0.3},
    ]

@app.get("/stocks/search")
def search_stocks(q: str):
    if not q:
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required")
    try:
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={q}"
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers)
        data = response.json()
        quotes = data.get("quotes", [])
        
        results = []
        for quote in quotes:
            if quote.get("exchange") == "NSI":
                results.append({
                    "ticker": quote.get("symbol", "").replace(".NS", ""),
                    "name": quote.get("shortname", quote.get("longname", quote.get("symbol", "")))
                })
        return results[:8]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stocks/quote/{ticker}", response_model=schemas.StockQuote)
def get_quote(ticker: str):
    ns_ticker = ticker.upper()
    if not (ns_ticker.endswith(".NS") or ns_ticker.endswith(".BO")):
        ns_ticker += ".NS"
    
    try:
        stock = yf.Ticker(ns_ticker)
        info = stock.info
        hist = stock.history(period="3mo")
        
        if hist.empty or len(hist) < 14:
            raise HTTPException(status_code=404, detail=f"Insufficient data for {ticker}")
        
        closes = hist['Close'].tolist()
        volumes = hist['Volume'].tolist()
        
        rsi = analyzer.compute_rsi(closes)
        
        recent_vol = sum(volumes[-3:]) / 3.0
        baseline_vol = sum(volumes[-10:]) / 10.0
        volume_trend = "up" if recent_vol > baseline_vol else "down"
        
        return {
            "ticker": ticker.upper(),
            "name": info.get("shortName", ticker.upper()),
            "price": info.get("regularMarketPrice", info.get("currentPrice", 0.0)),
            "change": info.get("regularMarketChange", 0.0),
            "change_pct": info.get("regularMarketChangePercent", 0.0),
            "volume": info.get("regularMarketVolume", info.get("volume", 0)),
            "rsi": rsi,
            "volumeTrend": volume_trend,
            "high_52w": info.get("fiftyTwoWeekHigh", 0.0),
            "low_52w": info.get("fiftyTwoWeekLow", 0.0)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# Portfolio  (auth-protected)
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/portfolio/{user_id}", response_model=schemas.PortfolioSummaryResponse)
def get_portfolio_summary(
    user_id: str,
    db: Session = Depends(database.get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user["uid"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied: you can only view your own portfolio.")

    portfolio = db.query(models.Portfolio).filter(models.Portfolio.user_id == user_id).first()
    
    if not portfolio:
        portfolio = models.Portfolio(user_id=user_id, virtual_cash=10000.0)
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
        return {
            "user_id": user_id,
            "virtual_cash": 10000.0,
            "holdings": [],
            "total_invested": 0.0,
            "total_current_value": 0.0,
            "total_pnl": 0.0,
            "total_pnl_pct": 0.0
        }
    
    holdings_out = []
    total_invested = 0.0
    total_current_val = 0.0
    
    for h in portfolio.holdings:
        cur_price = h.avg_buy_price
        try:
            ticker_ns = f"{h.ticker.upper()}.NS"
            stock = yf.Ticker(ticker_ns)
            info = stock.info
            cur_price = info.get("regularMarketPrice", info.get("currentPrice", h.avg_buy_price))
        except Exception:
            pass
        
        invested = h.quantity * h.avg_buy_price
        current_val = h.quantity * cur_price
        pnl = current_val - invested
        pnl_pct = (pnl / invested) * 100 if invested else 0.0
        
        total_invested += invested
        total_current_val += current_val
        
        holdings_out.append({
            "ticker": h.ticker,
            "quantity": h.quantity,
            "avg_buy_price": h.avg_buy_price,
            "current_price": round(cur_price, 2),
            "pnl": round(pnl, 2),
            "pnl_pct": round(pnl_pct, 2)
        })
        
    total_pnl = total_current_val - total_invested
    total_pnl_pct = (total_pnl / total_invested) * 100 if total_invested else 0.0
    
    return {
        "user_id": user_id,
        "virtual_cash": round(portfolio.virtual_cash, 2),
        "holdings": holdings_out,
        "total_invested": round(total_invested, 2),
        "total_current_value": round(total_current_val, 2),
        "total_pnl": round(total_pnl, 2),
        "total_pnl_pct": round(total_pnl_pct, 2)
    }

@app.get("/portfolio/history/{user_id}")
def get_portfolio_history(
    user_id: str,
    db: Session = Depends(database.get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user["uid"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied: you can only view your own trade history.")

    portfolio = db.query(models.Portfolio).filter(models.Portfolio.user_id == user_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
        
    trades = db.query(models.Trade).filter(models.Trade.portfolio_id == portfolio.id).order_by(models.Trade.executed_at.desc()).limit(50).all()
    
    results = []
    for t in trades:
        results.append({
            "id": t.id,
            "portfolio_id": t.portfolio_id,
            "ticker": t.ticker,
            "action": t.action,
            "quantity": t.quantity,
            "price": t.price,
            "total_value": t.total_value,
            "rsi_at_trade": t.rsi_at_trade,
            "volume_trend": t.volume_trend,
            "mistake_flags": t.mistake_flags,
            "mistakeFlags": json.loads(t.mistake_flags) if t.mistake_flags else [],
            "executed_at": t.executed_at.isoformat()
        })
    return results

@app.post("/portfolio/trade")
def execute_trade(
    trade: schemas.TradeRequest,
    db: Session = Depends(database.get_db),
    current_user: dict = Depends(get_current_user),
):
    # user_id is derived exclusively from the verified token — never from the request body.
    user_id = current_user["uid"]

    portfolio = db.query(models.Portfolio).filter(models.Portfolio.user_id == user_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
        
    ticker_ns = f"{trade.ticker}.NS" if not trade.ticker.endswith(".NS") else trade.ticker
    
    try:
        stock = yf.Ticker(ticker_ns)
        info = stock.info
        price = info.get("regularMarketPrice", info.get("currentPrice", 0.0))
        
        hist = stock.history(period="3mo")
        closes = hist['Close'].tolist() if not hist.empty else []
        rsi = analyzer.compute_rsi(closes)
        
        total_value = price * trade.quantity
        
        if trade.action == "BUY":
            if portfolio.virtual_cash < total_value:
                raise HTTPException(status_code=400, detail=f"Insufficient cash. Need ₹{total_value:.2f}, have ₹{portfolio.virtual_cash:.2f}")
            
            portfolio.virtual_cash -= total_value
            
            holding = db.query(models.Holding).filter(models.Holding.portfolio_id == portfolio.id, models.Holding.ticker == trade.ticker).first()
            if holding:
                old_total = holding.quantity * holding.avg_buy_price
                new_total = trade.quantity * price
                holding.quantity += trade.quantity
                holding.avg_buy_price = (old_total + new_total) / holding.quantity
            else:
                holding = models.Holding(portfolio_id=portfolio.id, ticker=trade.ticker, quantity=trade.quantity, avg_buy_price=price)
                db.add(holding)
                
            trade_analyzer = analyzer.TradeAnalyzer(price, price, rsi, "unknown")
            autopsy = trade_analyzer.analyze_loss()
            
            new_trade = models.Trade(
                portfolio_id=portfolio.id,
                ticker=trade.ticker,
                action="BUY",
                quantity=trade.quantity,
                price=price,
                total_value=total_value,
                rsi_at_trade=rsi,
                volume_trend="unknown",
                mistake_flags=json.dumps([autopsy])
            )
            db.add(new_trade)
            db.commit()
            
        elif trade.action == "SELL":
            holding = db.query(models.Holding).filter(models.Holding.portfolio_id == portfolio.id, models.Holding.ticker == trade.ticker).first()
            if not holding or holding.quantity < trade.quantity:
                raise HTTPException(status_code=400, detail=f"You don't hold enough {trade.ticker} shares.")
                
            portfolio.virtual_cash += total_value
            
            if holding.quantity == trade.quantity:
                db.delete(holding)
            else:
                holding.quantity -= trade.quantity
                
            trade_analyzer = analyzer.TradeAnalyzer(holding.avg_buy_price, price, rsi, "unknown")
            autopsy = trade_analyzer.analyze_loss()
            
            new_trade = models.Trade(
                portfolio_id=portfolio.id,
                ticker=trade.ticker,
                action="SELL",
                quantity=trade.quantity,
                price=price,
                total_value=total_value,
                rsi_at_trade=rsi,
                volume_trend="unknown",
                mistake_flags=json.dumps([autopsy])
            )
            db.add(new_trade)
            db.commit()
            
        return {"message": "Trade executed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/portfolio/reset", response_model=schemas.PortfolioResetResponse)
def reset_portfolio(
    db: Session = Depends(database.get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Resets the authenticated user's portfolio: virtual cash is restored to
    the default (₹10,000) and all holdings and trades are deleted.
    """
    user_id = current_user["uid"]

    portfolio = db.query(models.Portfolio).filter(models.Portfolio.user_id == user_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found. Trade first to create one.")

    # Delete all holdings
    db.query(models.Holding).filter(models.Holding.portfolio_id == portfolio.id).delete()
    # Delete all trades
    db.query(models.Trade).filter(models.Trade.portfolio_id == portfolio.id).delete()
    # Reset cash to default starting balance
    portfolio.virtual_cash = 10000.0

    db.commit()
    db.refresh(portfolio)

    return schemas.PortfolioResetResponse(
        user_id=user_id,
        virtual_cash=portfolio.virtual_cash,
        message="Portfolio has been reset successfully.",
    )


# ─────────────────────────────────────────────────────────────────────────────
# Users  (auth-protected)
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/users/{user_id}")
def get_user(
    user_id: str,
    db: Session = Depends(database.get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user["uid"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/users/{user_id}")
def sync_user(
    user_id: str,
    req: schemas.UserSyncRequest,
    db: Session = Depends(database.get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user["uid"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.name = req.name
    else:
        user = models.User(id=user_id, email=req.email, name=req.name, hashed_password="")
        db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.patch("/users/{user_id}")
def update_user(
    user_id: str,
    req: schemas.UserUpdateRequest,
    db: Session = Depends(database.get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user["uid"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if req.name is not None: user.name = req.name
    if req.bio is not None: user.bio = req.bio
    if req.college is not None: user.college = req.college
    if req.profile_photo is not None: user.profile_photo = req.profile_photo
    
    db.commit()
    db.refresh(user)
    return user


# ─────────────────────────────────────────────────────────────────────────────
# Groups  (auth-protected where user context matters)
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/groups")
def get_groups(user_id: str, db: Session = Depends(database.get_db)):
    groups = db.query(models.Group).join(models.GroupMember).filter(models.GroupMember.user_id == user_id).all()
    # To include members count:
    results = []
    for g in groups:
        members_count = db.query(models.GroupMember).filter(models.GroupMember.group_id == g.id).count()
        results.append({
            "id": g.id,
            "name": g.name,
            "invite_code": g.invite_code,
            "vote_mode": g.vote_mode,
            "virtual_corpus": g.virtual_corpus,
            "created_by": g.created_by,
            "created_at": g.created_at.isoformat(),
            "_count": {"members": members_count}
        })
    return results

@app.post("/groups")
def create_group(req: schemas.GroupCreateRequest, db: Session = Depends(database.get_db)):
    invite_code = 'TL-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    group = models.Group(
        name=req.name,
        created_by=req.created_by,
        invite_code=invite_code,
        virtual_corpus=req.initial_contribution,
        vote_mode=req.vote_mode or "majority"
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    
    member = models.GroupMember(
        group_id=group.id,
        user_id=req.created_by,
        contribution=req.initial_contribution,
        units_held=req.initial_contribution / 100.0
    )
    db.add(member)
    db.commit()
    
    return group

@app.post("/groups/vote")
def cast_vote(
    req: schemas.VoteRequest,
    db: Session = Depends(database.get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user["uid"] != req.voter_id:
        raise HTTPException(status_code=403, detail="Access denied: you may only cast your own vote.")

    proposal = db.query(models.Proposal).filter(models.Proposal.id == req.proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    if proposal.status != "open":
        raise HTTPException(status_code=400, detail=f"Already {proposal.status}")
        
    existing_vote = db.query(models.Vote).filter(models.Vote.proposal_id == req.proposal_id, models.Vote.voter_id == req.voter_id).first()
    if existing_vote:
        raise HTTPException(status_code=400, detail="Already voted")
        
    vote = models.Vote(proposal_id=req.proposal_id, voter_id=req.voter_id, vote=req.vote)
    db.add(vote)
    db.commit()
    
    # Strategy
    all_votes = db.query(models.Vote).filter(models.Vote.proposal_id == req.proposal_id).all()
    yes_count = sum(1 for v in all_votes if v.vote in ["yes", "disagree_but_allow"])
    no_count = sum(1 for v in all_votes if v.vote == "no")
    total_members = db.query(models.GroupMember).filter(models.GroupMember.group_id == proposal.group_id).count()
    
    new_status = proposal.status
    if proposal.group.vote_mode == "majority":
        majority = (total_members // 2) + 1
        if yes_count >= majority:
            new_status = "executed"
        elif no_count >= majority:
            new_status = "rejected"
    else:
        if yes_count == total_members:
            new_status = "executed"
        elif no_count >= 1:
            new_status = "rejected"
            
    if new_status == "executed":
        # Group trade execution (simplified logic)
        try:
            group = proposal.group
            quote = yf.Ticker(f"{proposal.ticker}.NS").info
            price = quote.get("regularMarketPrice", proposal.price_at_proposal)
            cost = price * proposal.quantity
            
            if proposal.action == "BUY" and group.virtual_corpus >= cost:
                group.virtual_corpus -= cost
                gholding = db.query(models.GroupHolding).filter(models.GroupHolding.group_id == group.id, models.GroupHolding.ticker == proposal.ticker).first()
                if gholding:
                    gholding.avg_buy_price = ((gholding.quantity * gholding.avg_buy_price) + cost) / (gholding.quantity + proposal.quantity)
                    gholding.quantity += proposal.quantity
                else:
                    db.add(models.GroupHolding(group_id=group.id, ticker=proposal.ticker, quantity=proposal.quantity, avg_buy_price=price))
            elif proposal.action == "SELL":
                group.virtual_corpus += cost
                gholding = db.query(models.GroupHolding).filter(models.GroupHolding.group_id == group.id, models.GroupHolding.ticker == proposal.ticker).first()
                if gholding:
                    if gholding.quantity == proposal.quantity:
                        db.delete(gholding)
                    else:
                        gholding.quantity -= proposal.quantity
        except Exception as e:
            print("Group trade execution failed", e)
            
    proposal.status = new_status
    db.commit()
    
    return {"status": new_status}


# ─────────────────────────────────────────────────────────────────────────────
# AI Analysis  (public — no auth required)
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/ai/autopsy")
def generate_autopsy(req: schemas.AutopsyRequest):
    trade_analyzer = analyzer.TradeAnalyzer(req.entry_price, req.current_price, req.rsi, req.volume_trend)
    rule_based = trade_analyzer.analyze_loss()
    score = trade_analyzer.get_trade_quality_score()
    
    pnl = req.current_price - req.entry_price
    pnl_pct = (pnl / req.entry_price) * 100 if req.entry_price else 0
    
    ai_explanation = ""
    
    if os.environ.get("NEXT_PUBLIC_GEMINI_API_KEY"):
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"""You are an AI trading mentor inside TradeLab. Explain this trade in 3-4 simple sentences. 
            Stock: {req.ticker}, Action: {req.action}, Entry: ₹{req.entry_price}, Current: ₹{req.current_price}, P&L: {pnl_pct:.1f}%, Quantity: {req.quantity}, RSI: {req.rsi}, Volume: {req.volume_trend}.
            Keep it under 80 words. Refer to the student as "you". Focused on RSI and Volume logic."""
            
            response = model.generate_content(prompt)
            ai_explanation = response.text
        except Exception:
            ai_explanation = f"Your trade showed an RSI of {req.rsi:.0f} with {req.volume_trend} volume. {rule_based['lesson']} {rule_based['fix']}"
    else:
        status = 'overbought territory' if req.rsi > 70 else 'neutral range'
        ai_explanation = f"At the time of your trade, RSI was {req.rsi:.0f} — {status}. Volume was trending {req.volume_trend}. {rule_based['fix']}"
        
    return {
        "rule_based": rule_based,
        "ai_explanation": ai_explanation,
        "score": score
    }

@app.post("/ai/analyze-trade", response_model=schemas.TradeAnalysisResponse)
def analyze_trade(req: schemas.TradeAnalysisRequest):
    stock_name = req.name or req.ticker
    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("NEXT_PUBLIC_GEMINI_API_KEY", "")
    
    if gemini_key:
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"""Analyze this paper trade for a student learning the stock market:
Stock: {req.ticker} ({stock_name})
Current Price: ₹{req.price}
Action: {req.action}
Quantity: {req.quantity}
Total Value: ₹{req.total_value}

Provide a brief, encouraging analysis (max 3 sentences) explaining why this might be a good or risky move for a beginner.
Also, identify any "mistake flags" (e.g., FOMO, lack of diversification, over-leveraging) if applicable.

Return response in valid JSON format:
{{
  "analysis": "Your 2-3 sentence analysis here.",
  "flags": "Comma separated flags or 'None'"
}}"""
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            # Clean markdown fences if any
            clean_text = raw_text.replace("```json", "").replace("```", "").strip()
            data = json.loads(clean_text)
            return schemas.TradeAnalysisResponse(
                analysis=data.get("analysis", "Trade executed successfully. Keep learning!"),
                flags=data.get("flags", "None")
            )
        except Exception as e:
            print(f"Gemini trade analysis failed: {e}")
            
    # Rule-based fallback
    flag = "None"
    if req.total_value > 50000:
        flag = "High Capital Allocation"
        analysis = f"Placing ₹{req.total_value:,.2f} on a single trade is aggressive for a student portfolio. Consider diversifying across sectors."
    elif req.action.upper() == "BUY":
        analysis = f"Entered {req.ticker} at ₹{req.price:.2f}. Maintain risk discipline and set a clear exit plan."
    else:
        analysis = f"Sold {req.ticker} at ₹{req.price:.2f}. Review your profit/loss against your initial trade plan."

    return schemas.TradeAnalysisResponse(analysis=analysis, flags=flag)
