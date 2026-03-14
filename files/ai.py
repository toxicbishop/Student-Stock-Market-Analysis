from fastapi import APIRouter, HTTPException
from schemas import AutopsyRequest, AutopsyResponse
from analyzer import TradeAnalyzer
from database import get_settings
import anthropic

router = APIRouter(prefix="/ai", tags=["ai"])


def build_autopsy_prompt(req: AutopsyRequest) -> str:
    pnl      = req.current_price - req.entry_price
    pnl_pct  = (pnl / req.entry_price) * 100
    direction = "profit" if pnl >= 0 else "loss"

    return f"""You are an AI trading mentor inside TradeLab, a paper trading app for Indian college students.
A student just made this trade. Explain what happened in simple, friendly language — like a senior explaining to a junior.

TRADE DETAILS:
- Stock: {req.ticker} (NSE)
- Action: {req.action}
- Entry price: ₹{req.entry_price:.2f}
- Current price: ₹{req.current_price:.2f}
- P&L: ₹{abs(pnl):.2f} {direction} ({abs(pnl_pct):.1f}%)
- Quantity: {req.quantity} shares
- RSI at trade time: {req.rsi:.1f}
- Volume trend: {req.volume_trend} (compared to 10-day average)

CONTEXT:
- RSI > 70 = overbought (dangerous to buy), RSI < 30 = oversold (potential buy)
- Rising volume confirms a price move; falling volume = weak move

Write a 3–4 sentence explanation covering:
1. What the indicators were saying at trade time
2. Whether this was a good or risky entry
3. One specific thing the student should do differently next time

Keep it under 80 words. Use plain English, no jargon. Refer to the student as "you".
Do NOT use bullet points — write in flowing sentences."""


@router.post("/autopsy", response_model=AutopsyResponse)
async def trade_autopsy(req: AutopsyRequest):
    """
    Full trade analysis:
    1. Rule-based mistake detection (instant, from TradeAnalyzer)
    2. AI plain-English explanation (Claude API)
    3. Trade quality score 0–100
    """
    settings = get_settings()

    # ── Step 1: Rule-based analysis (your existing TradeAnalyzer) ─────────────
    analyzer     = TradeAnalyzer(
        entry_price   = req.entry_price,
        current_price = req.current_price,
        rsi_value     = req.rsi,
        volume_trend  = req.volume_trend,
    )
    mistake_flag = analyzer.analyze_loss()
    score        = analyzer.trade_quality_score()

    # ── Step 2: Claude AI explanation ─────────────────────────────────────────
    ai_explanation = ""
    if settings.ANTHROPIC_API_KEY:
        try:
            client   = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            message  = client.messages.create(
                model      = "claude-sonnet-4-20250514",
                max_tokens = 200,
                messages   = [{"role": "user", "content": build_autopsy_prompt(req)}],
            )
            ai_explanation = message.content[0].text.strip()
        except Exception as e:
            # Graceful fallback — don't crash if API key missing during demo
            ai_explanation = (
                f"Your trade showed an RSI of {req.rsi:.0f} with {req.volume_trend} volume. "
                f"{mistake_flag.lesson} {mistake_flag.fix}"
            )
    else:
        # Demo fallback when API key not configured
        ai_explanation = (
            f"At the time of your trade, RSI was {req.rsi:.0f} — "
            f"{'overbought territory' if req.rsi > 70 else 'neutral range'}. "
            f"Volume was trending {req.volume_trend}, which "
            f"{'weakens' if req.volume_trend == 'down' else 'confirms'} the price move. "
            f"{mistake_flag.fix}"
        )

    return AutopsyResponse(
        rule_based     = mistake_flag,
        ai_explanation = ai_explanation,
        score          = score,
    )


@router.post("/quick-analyze")
async def quick_analyze(entry_price: float, current_price: float,
                        rsi: float, volume_trend: str):
    """Lightweight rule-only check — no Claude API call. Use for instant feedback."""
    analyzer = TradeAnalyzer(entry_price, current_price, rsi, volume_trend)
    return {
        "mistake": analyzer.analyze_loss(),
        "score":   analyzer.trade_quality_score(),
    }
