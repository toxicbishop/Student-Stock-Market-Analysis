from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from database import create_tables, get_settings
from routers import stocks, portfolio, ai, groups, auth, users
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure uploads directory exists
    os.makedirs("uploads", exist_ok=True)
    # Create all tables on startup
    await create_tables()
    yield


settings = get_settings()

app = FastAPI(
    title       = "TradeLab API",
    description = "AI-powered virtual trading platform for Indian college students.",
    version     = "1.0.0",
    lifespan    = lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
origins = settings.CORS_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins     = origins,
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ─── Static Files (Profile Photos) ───────────────────────────────────────────
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(stocks.router)
app.include_router(portfolio.router)
app.include_router(ai.router)
app.include_router(groups.router)


# ─── Health + quick-start routes ──────────────────────────────────────────────

@app.get("/", tags=["health"])
async def root():
    return {
        "app"    : "TradeLab API",
        "status" : "running",
        "docs"   : "/docs",
    }


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}


# ─── Demo user seed (for hackathon — remove in prod) ──────────────────────────

@app.post("/demo/seed", tags=["demo"])
async def seed_demo_users():
    """
    Creates 3 demo users + portfolios for hackathon demo.
    Call once after starting the server.
    """
    from database import AsyncSessionLocal
    from models import User, Portfolio, Holding, Trade, TradeAction
    from sqlalchemy import select
    from auth_utils import get_password_hash
    import uuid

    demo_users = [
        {"id": "demo-user-1", "name": "Pranav",  "email": "pranav@tradelab.app", "password": "f4wOCTsc9O"},
        {"id": "demo-user-2", "name": "Mithil",  "email": "mithil@tradelab.app", "password": "f4wOCTsc9O"},
        {"id": "demo-user-3", "name": "Supreeth",   "email": "supreeth@tradelab.app", "password": "f4wOCTsc9O"},
    ]

    from sqlalchemy import delete
    async with AsyncSessionLocal() as db:
        for u in demo_users:
            # Upsert user
            user = (await db.execute(select(User).where(User.id == u["id"]))).scalar_one_or_none()
            if not user:
                user = User(
                    id=u["id"], 
                    name=u["name"], 
                    email=u["email"],
                    hashed_password=get_password_hash(u["password"])
                )
                db.add(user)
            else:
                user.name = u["name"]
                user.email = u["email"]

            # Clear existing portfolio data for a fresh seed
            await db.execute(delete(Trade).where(Trade.portfolio_id.in_(
                select(Portfolio.id).where(Portfolio.user_id == u["id"])
            )))
            await db.execute(delete(Holding).where(Holding.portfolio_id.in_(
                select(Portfolio.id).where(Portfolio.user_id == u["id"])
            )))
            await db.execute(delete(Portfolio).where(Portfolio.user_id == u["id"]))

            # Create fresh demo portfolio
            portfolio = Portfolio(
                id           = str(uuid.uuid4()),
                user_id      = u["id"],
                virtual_cash = 81550.0 
            )
            db.add(portfolio)
            await db.flush() # Get portfolio.id

            # Add fresh dummy data
            db.add(Holding(portfolio_id=portfolio.id, ticker="RELIANCE", quantity=5, avg_buy_price=2450.0))
            db.add(Holding(portfolio_id=portfolio.id, ticker="TATAMOTORS", quantity=10, avg_buy_price=620.0))
            db.add(Holding(portfolio_id=portfolio.id, ticker="INFY", quantity=3, avg_buy_price=1450.0))
            
            db.add(Trade(
                portfolio_id=portfolio.id, ticker="RELIANCE", action=TradeAction.BUY,
                quantity=5, price=2450.0, total_value=12250.0
            ))
            db.add(Trade(
                portfolio_id=portfolio.id, ticker="TATAMOTORS", action=TradeAction.BUY,
                quantity=10, price=620.0, total_value=6200.0
            ))
        await db.commit()

    return {"message": "Demo users seeded", "users": [u["name"] for u in demo_users]}
