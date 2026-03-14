from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import create_tables, get_settings
from routers import stocks, portfolio, ai, groups


@asynccontextmanager
async def lifespan(app: FastAPI):
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

# ─── Routers ──────────────────────────────────────────────────────────────────
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
    from models import User, Portfolio
    from sqlalchemy import select
    import uuid

    demo_users = [
        {"id": "demo-user-1", "name": "Pranav",  "email": "pranav@tradelab.app"},
        {"id": "demo-user-2", "name": "Arjun",   "email": "arjun@tradelab.app"},
        {"id": "demo-user-3", "name": "Sneha",   "email": "sneha@tradelab.app"},
    ]

    async with AsyncSessionLocal() as db:
        for u in demo_users:
            result = await db.execute(select(User).where(User.id == u["id"]))
            if not result.scalar_one_or_none():
                user = User(id=u["id"], name=u["name"], email=u["email"])
                db.add(user)
                portfolio = Portfolio(
                    id           = str(uuid.uuid4()),
                    user_id      = u["id"],
                    virtual_cash = 10000.0,
                )
                db.add(portfolio)
        await db.commit()

    return {"message": "Demo users seeded", "users": [u["name"] for u in demo_users]}
