"""
TradeAnalyzer — rule-based mistake detection engine.
Original logic by the TradeLab team, extended for API use.
"""
from schemas import MistakeFlag


class TradeAnalyzer:
    def __init__(self, entry_price: float, current_price: float,
                 rsi_value: float, volume_trend: str):
        self.entry_price   = entry_price
        self.current_price = current_price
        self.rsi           = rsi_value      # Relative Strength Index
        self.volume        = volume_trend   # 'up' or 'down'

    def analyze_loss(self) -> MistakeFlag:
        # ── Rule 1: The FOMO Peak ────────────────────────────────────────────
        if self.rsi > 75 and self.volume == "down":
            return MistakeFlag(
                flag="The FOMO Peak",
                severity="critical",
                lesson=(
                    f"You bought when RSI was {self.rsi:.1f} — well above 70. "
                    "The market was already exhausted and volume was drying up. "
                    "This is a classic late-entry trap."
                ),
                fix="Wait for a cooldown (RSI < 50) before entering a trending stock.",
            )

        # ── Rule 2: The Falling Knife ─────────────────────────────────────────
        if self.current_price < self.entry_price and self.volume == "up":
            loss_pct = ((self.current_price - self.entry_price) / self.entry_price) * 100
            return MistakeFlag(
                flag="The Falling Knife",
                severity="critical",
                lesson=(
                    f"The stock dropped {abs(loss_pct):.1f}% on rising volume. "
                    "High-volume selling means institutional players are exiting. "
                    "Catching a falling knife before it finds a floor almost always causes more loss."
                ),
                fix="Never average down on a stock with no visible support floor and rising sell volume.",
            )

        # ── Rule 3: Overbought with no confirmation ───────────────────────────
        if self.rsi > 65:
            return MistakeFlag(
                flag="Overbought Entry",
                severity="warning",
                lesson=(
                    f"RSI of {self.rsi:.1f} signals the stock is in overbought territory. "
                    "There's no confirmation of continuation."
                ),
                fix="Look for a pullback to RSI 45–55 before entering to improve risk/reward.",
            )

        # ── Rule 4: No stop-loss discipline (price already down) ──────────────
        if self.current_price < self.entry_price * 0.95:
            loss_pct = ((self.current_price - self.entry_price) / self.entry_price) * 100
            return MistakeFlag(
                flag="Missing Stop-Loss",
                severity="warning",
                lesson=(
                    f"The position is down {abs(loss_pct):.1f}% and still open. "
                    "Without a predefined stop-loss, small losses turn into large ones."
                ),
                fix="Always set a stop-loss at 3–5% below your entry before placing any trade.",
            )

        # ── Default: standard market volatility ──────────────────────────────
        return MistakeFlag(
            flag="Market Volatility",
            severity="info",
            lesson="This appears to be standard market movement with no clear mistake pattern detected.",
            fix="Review your stop-loss placement and position sizing before the next trade.",
        )

    def trade_quality_score(self) -> int:
        """
        Returns 0–100 score for trade quality.
        Used to show the student a simple grade.
        """
        score = 100

        if self.rsi > 75:
            score -= 40
        elif self.rsi > 65:
            score -= 20

        if self.current_price < self.entry_price and self.volume == "up":
            score -= 30

        if self.current_price < self.entry_price * 0.95:
            score -= 15

        if self.volume == "down" and self.current_price < self.entry_price:
            score -= 10

        return max(0, score)
