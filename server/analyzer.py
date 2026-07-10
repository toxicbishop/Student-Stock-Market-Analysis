class TradeAnalyzer:
    def __init__(self, entry_price: float, current_price: float, rsi: float, volume_trend: str):
        self.entry_price = entry_price
        self.current_price = current_price
        self.rsi = rsi
        self.volume_trend = volume_trend

    def analyze_loss(self) -> dict:
        # Rule 1: The FOMO Peak
        if self.rsi > 75 and self.volume_trend == 'down':
            return {
                'flag': 'The FOMO Peak',
                'severity': 'critical',
                'lesson': f"You bought when RSI was {self.rsi:.1f} — well above 70. The market was already exhausted and volume was drying up. This is a classic late-entry trap.",
                'fix': 'Wait for a cooldown (RSI < 50) before entering a trending stock.',
            }

        # Rule 2: The Falling Knife
        if self.current_price < self.entry_price and self.volume_trend == 'up':
            loss_pct = ((self.current_price - self.entry_price) / self.entry_price) * 100
            return {
                'flag': 'The Falling Knife',
                'severity': 'critical',
                'lesson': f"The stock dropped {abs(loss_pct):.1f}% on rising volume. High-volume selling means institutional players are exiting. Catching a falling knife before it finds a floor almost always causes more loss.",
                'fix': 'Never average down on a stock with no visible support floor and rising sell volume.',
            }

        # Rule 3: Overbought Entry
        if self.rsi > 65:
            return {
                'flag': 'Overbought Entry',
                'severity': 'warning',
                'lesson': f"RSI of {self.rsi:.1f} signals the stock is in overbought territory. There's no confirmation of continuation.",
                'fix': 'Look for a pullback to RSI 45–55 before entering to improve risk/reward.',
            }

        # Rule 4: Missing Stop-Loss
        if self.current_price < self.entry_price * 0.95:
            loss_pct = ((self.current_price - self.entry_price) / self.entry_price) * 100
            return {
                'flag': 'Missing Stop-Loss',
                'severity': 'warning',
                'lesson': f"The position is down {abs(loss_pct):.1f}% and still open. Without a predefined stop-loss, small losses turn into large ones.",
                'fix': 'Always set a stop-loss at 3–5% below your entry before placing any trade.',
            }

        return {
            'flag': 'Market Volatility',
            'severity': 'info',
            'lesson': 'This appears to be standard market movement with no clear mistake pattern detected.',
            'fix': 'Review your stop-loss placement and position sizing before the next trade.',
        }

    def get_trade_quality_score(self) -> int:
        score = 100
        if self.rsi > 75:
            score -= 40
        elif self.rsi > 65:
            score -= 20

        if self.current_price < self.entry_price and self.volume_trend == 'up':
            score -= 30
        if self.current_price < self.entry_price * 0.95:
            score -= 15
        if self.volume_trend == 'down' and self.current_price < self.entry_price:
            score -= 10

        return max(0, score)

def compute_rsi(prices: list[float]) -> float:
    if len(prices) < 15:
        return 50.0
    gains = 0.0
    losses = 0.0
    for i in range(1, 15):
        diff = prices[-i] - prices[-i-1]
        if diff > 0:
            gains += diff
        else:
            losses -= diff
    rs = gains / (losses if losses > 0 else 1.0)
    return 100.0 - (100.0 / (1.0 + rs))
