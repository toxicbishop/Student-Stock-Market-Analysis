import type { NextApiRequest, NextApiResponse } from 'next';
import yahooFinance from 'yahoo-finance2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { ticker } = req.query;
  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: 'Ticker is required' });
  }

  const nsTicker = ticker.toUpperCase().endsWith('.NS') || ticker.toUpperCase().endsWith('.BO') 
    ? ticker 
    : `${ticker}.NS`;

  try {
    const quote = await yahooFinance.quote(nsTicker);
    const history = await yahooFinance.historical(nsTicker, {
      period1: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3mo
      interval: '1d',
    });

    if (!history || (history as any).length < 14) {
      return res.status(404).json({ error: `Insufficient data for ${ticker}` });
    }

    // Computing RSI (Simplified)
    const computeRSI = (prices: number[]) => {
      let gains = 0;
      let losses = 0;
      for (let i = 1; i < 15; i++) {
        const diff = prices[prices.length - i] - prices[prices.length - i - 1];
        if (diff > 0) gains += diff;
        else losses -= diff;
      }
      const rs = gains / (losses || 1);
      return Math.round(100 - (100 / (1 + rs)));
    };

    const rsi = computeRSI((history as any).map((h: any) => h.close));
    const recentVol = (history as any).slice(-3).reduce((a: any, b: any) => a + b.volume, 0) / 3;
    const baselineVol = (history as any).slice(-10).reduce((a: any, b: any) => a + b.volume, 0) / 10;
    const volumeTrend = recentVol > baselineVol ? 'up' : 'down';

    res.status(200).json({
      ticker: ticker.toUpperCase(),
      name: (quote as any).shortName || ticker.toUpperCase(),
      price: (quote as any).regularMarketPrice,
      change: (quote as any).regularMarketChange || 0,
      change_pct: (quote as any).regularMarketChangePercent || 0,
      volume: (quote as any).regularMarketVolume,
      rsi,
      volumeTrend,
      high_52w: (quote as any).fiftyTwoWeekHigh,
      low_52w: (quote as any).fiftyTwoWeekLow,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
}
