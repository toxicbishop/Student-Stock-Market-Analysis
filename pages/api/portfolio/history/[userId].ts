import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../src/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const portfolio = await prisma.portfolio.findUnique({ where: { user_id: userId } });
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    const trades = await prisma.trade.findMany({
      where: { portfolio_id: portfolio.id },
      orderBy: { executed_at: 'desc' },
      take: 50,
    });

    res.status(200).json(trades.map(t => ({
      ...t,
      mistakeFlags: JSON.parse(t.mistake_flags || '[]')
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
