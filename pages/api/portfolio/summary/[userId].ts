import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../src/lib/db';
import yahooFinance from 'yahoo-finance2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { user_id: userId },
      include: { holdings: true },
    });

    if (!portfolio) {
      // Create portfolio on the fly if it doesn't exist (helpful when using Firebase auth)
      const newPortfolio = await prisma.portfolio.create({
        data: {
          user_id: userId,
          virtual_cash: 10000.0,
        },
        include: { holdings: true },
      });
      return res.status(200).json({
        user_id: userId,
        virtual_cash: 10000.0,
        holdings: [],
        total_invested: 0,
        total_current_value: 0,
        total_pnl: 0,
        total_pnl_pct: 0,
      });
    }

    const holdings_out = [];
    let total_invested = 0;
    let total_current_val = 0;

    for (const h of portfolio.holdings) {
      let cur_price = h.avg_buy_price;
      try {
        const quote = await yahooFinance.quote(`${h.ticker.toUpperCase()}.NS`);
        cur_price = (quote as any).regularMarketPrice || h.avg_buy_price;
      } catch (e) {
        console.error(`Failed to get price for ${h.ticker}`, e);
      }

      const invested = h.quantity * h.avg_buy_price;
      const current_val = h.quantity * cur_price;
      const pnl = current_val - invested;
      const pnl_pct = invested ? (pnl / invested) * 100 : 0;

      total_invested += invested;
      total_current_val += current_val;

      holdings_out.push({
        ticker: h.ticker,
        quantity: h.quantity,
        avg_buy_price: h.avg_buy_price,
        current_price: Number(cur_price.toFixed(2)),
        pnl: Number(pnl.toFixed(2)),
        pnl_pct: Number(pnl_pct.toFixed(2)),
      });
    }

    const total_pnl = total_current_val - total_invested;
    const total_pnl_pct = total_invested ? (total_pnl / total_invested) * 100 : 0;

    res.status(200).json({
      user_id: userId,
      virtual_cash: Number(portfolio.virtual_cash.toFixed(2)),
      holdings: holdings_out,
      total_invested: Number(total_invested.toFixed(2)),
      total_current_value: Number(total_current_val.toFixed(2)),
      total_pnl: Number(total_pnl.toFixed(2)),
      total_pnl_pct: Number(total_pnl_pct.toFixed(2)),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
