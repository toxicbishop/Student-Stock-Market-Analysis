import type { NextApiRequest, NextApiResponse } from 'next';
import yahooFinance from 'yahoo-finance2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // List of popular Indian stocks for the dashboard
    const tickers = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'BAJFINANCE.NS', 'HDFCBANK.NS', 'TATAMOTORS.NS'];
    
    const results = await Promise.all(
      tickers.map(async (ticker) => {
        try {
          const quote = await yahooFinance.quote(ticker);
          const history = await yahooFinance.historical(ticker, {
            period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
            interval: '1d',
          });
          
          return {
            ticker: ticker.replace('.NS', ''),
            name: (quote as any).shortName || ticker,
            price: (quote as any).regularMarketPrice || 0,
            change: (quote as any).regularMarketChangePercent || 0,
            trend: (history as any).map((h: any) => h.close).slice(-10), // Last 10 days
          };
        } catch (e) {
          console.error(`Failed to fetch ${ticker}:`, e);
          return null;
        }
      })
    );

    res.status(200).json(results.filter(Boolean));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
