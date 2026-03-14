class TradeAnalyzer:
    def __init__(self, entry_price, current_price, rsi_value, volume_trend):
        self.entry_price = entry_price
        self.current_price = current_price
        self.rsi = rsi_value # Relative Strength Index
        self.volume = volume_trend # 'up' or 'down'

    def analyze_loss(self):
        # Rule 1: The FOMO (Fear Of Missing Out) Trap
        if self.rsi > 75 and self.volume == 'down':
            return {
                "error_type": "The FOMO Peak",
                "lesson": "You bought when the RSI was over 75. The market was exhausted.",
                "fix": "Wait for a cooldown (RSI < 50) before entering a trending stock."
            }

        # Rule 2: The Falling Knife
        if self.current_price < self.entry_price and self.volume == 'up':
            return {
                "error_type": "The Falling Knife",
                "lesson": "You tried to catch a crashing stock. High volume selling means the 'big players' are exiting.",
                "fix": "Never average down on a stock that hasn't found a support floor."
            }

        return {"error_type": "Market Volatility", "lesson": "Standard market move.", "fix": "Check your Stop-Loss."}

# Example Hackathon Demo Trigger:
user_trade = TradeAnalyzer(entry_price=250, current_price=235, rsi_value=82, volume_trend='down')
print(user_trade.analyze_loss())