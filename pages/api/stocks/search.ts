import type { NextApiRequest, NextApiResponse } from 'next';
import yahooFinance from 'yahoo-finance2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;
  if (!q || typeof q !== 'string' || q.length < 1) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    const searchResult: any = await yahooFinance.search(q);
    const results = searchResult.quotes
      .filter((q: any) => q.isYahooFinance && q.exchange === 'NSI') // NSE ONLY
      .map((q: any) => ({
        ticker: q.symbol.replace('.NS', ''),
        name: q.shortname || q.longname || q.symbol,
      }));

    res.status(200).json(results.slice(0, 8));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
