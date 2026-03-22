import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Demo leaderboard data as seen in the Python backend
  return res.status(200).json([
    { ticker: 'RELIANCE',   trades: 142, change_pct: 1.2 },
    { ticker: 'TCS',        trades: 118, change_pct: -0.5 },
    { ticker: 'INFY',       trades: 97,  change_pct: 0.8 },
    { ticker: 'BAJFINANCE', trades: 84,  change_pct: 2.1 },
    { ticker: 'HDFCBANK',   trades: 76,  change_pct: -0.3 },
  ]);
}
