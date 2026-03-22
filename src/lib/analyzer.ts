export interface MistakeFlag {
  flag: string;
  severity: 'critical' | 'warning' | 'info';
  lesson: string;
  fix: string;
}

export class TradeAnalyzer {
  constructor(
    private entryPrice: number,
    private currentPrice: number,
    private rsi: number,
    private volumeTrend: string
  ) {}

  analyzeLoss(): MistakeFlag {
    // Rule 1: The FOMO Peak
    if (this.rsi > 75 && this.volumeTrend === 'down') {
      return {
        flag: 'The FOMO Peak',
        severity: 'critical',
        lesson: `You bought when RSI was ${this.rsi.toFixed(1)} — well above 70. The market was already exhausted and volume was drying up. This is a classic late-entry trap.`,
        fix: 'Wait for a cooldown (RSI < 50) before entering a trending stock.',
      };
    }

    // Rule 2: The Falling Knife
    if (this.currentPrice < this.entryPrice && this.volumeTrend === 'up') {
      const lossPct = ((this.currentPrice - this.entryPrice) / this.entryPrice) * 100;
      return {
        flag: 'The Falling Knife',
        severity: 'critical',
        lesson: `The stock dropped ${Math.abs(lossPct).toFixed(1)}% on rising volume. High-volume selling means institutional players are exiting. Catching a falling knife before it finds a floor almost always causes more loss.`,
        fix: 'Never average down on a stock with no visible support floor and rising sell volume.',
      };
    }

    // Rule 3: Overbought Entry
    if (this.rsi > 65) {
      return {
        flag: 'Overbought Entry',
        severity: 'warning',
        lesson: `RSI of ${this.rsi.toFixed(1)} signals the stock is in overbought territory. There's no confirmation of continuation.`,
        fix: 'Look for a pullback to RSI 45–55 before entering to improve risk/reward.',
      };
    }

    // Rule 4: Missing Stop-Loss
    if (this.currentPrice < this.entryPrice * 0.95) {
      const lossPct = ((this.currentPrice - this.entryPrice) / this.entryPrice) * 100;
      return {
        flag: 'Missing Stop-Loss',
        severity: 'warning',
        lesson: `The position is down ${Math.abs(lossPct).toFixed(1)}% and still open. Without a predefined stop-loss, small losses turn into large ones.`,
        fix: 'Always set a stop-loss at 3–5% below your entry before placing any trade.',
      };
    }

    return {
      flag: 'Market Volatility',
      severity: 'info',
      lesson: 'This appears to be standard market movement with no clear mistake pattern detected.',
      fix: 'Review your stop-loss placement and position sizing before the next trade.',
    };
  }

  getTradeQualityScore(): number {
    let score = 100;
    if (this.rsi > 75) score -= 40;
    else if (this.rsi > 65) score -= 20;

    if (this.currentPrice < this.entryPrice && this.volumeTrend === 'up') score -= 30;
    if (this.currentPrice < this.entryPrice * 0.95) score -= 15;
    if (this.volumeTrend === 'down' && this.currentPrice < this.entryPrice) score -= 10;

    return Math.max(0, score);
  }
}
