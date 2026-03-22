import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../src/lib/db';
import yahooFinance from 'yahoo-finance2';
import { TradeAnalyzer } from '../../../src/lib/analyzer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { userId, ticker, quantity, action } = req.body;
  if (!userId || !ticker || !quantity || !action) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const ticker_ns = ticker.toUpperCase().endsWith('.NS') ? ticker.toUpperCase() : `${ticker.toUpperCase()}.NS`;

  try {
    const portfolio = await prisma.portfolio.findUnique({ where: { user_id: userId } });
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    const quote = await yahooFinance.quote(ticker_ns);
    const hist = await yahooFinance.historical(ticker_ns, {
        period1: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        interval: '1d',
    });

    const price = quote.regularMarketPrice || 0;
    const totalValue = price * quantity;

    if (action === 'BUY') {
      if (portfolio.virtual_cash < totalValue) {
        return res.status(400).json({ error: `Insufficient cash. Need ₹${totalValue.toFixed(2)}, have ₹${portfolio.virtual_cash.toFixed(2)}` });
      }

      await prisma.$transaction(async (tx) => {
        // Update cash
        await tx.portfolio.update({
          where: { id: portfolio.id },
          data: { virtual_cash: { decrement: totalValue } }
        });

        // Update holding
        const existingHolding = await tx.holding.findFirst({
          where: { portfolio_id: portfolio.id, ticker: ticker.toUpperCase() }
        });

        if (existingHolding) {
          const oldTotal = existingHolding.quantity * existingHolding.avg_buy_price;
          const newTotal = quantity * price;
          const newQuantity = existingHolding.quantity + quantity;
          const newAvgPrice = (oldTotal + newTotal) / newQuantity;
          await tx.holding.update({
            where: { id: existingHolding.id },
            data: { quantity: newQuantity, avg_buy_price: newAvgPrice }
          });
        } else {
          await tx.holding.create({
            data: { portfolio_id: portfolio.id, ticker: ticker.toUpperCase(), quantity, avg_buy_price: price }
          });
        }

        // Analysis
        const rsi = computeRSI(hist.map(h => h.close));
        const analyzer = new TradeAnalyzer(price, price, rsi, 'unknown');
        const autopsy = analyzer.analyzeLoss();

        // Record trade
        await tx.trade.create({
          data: {
            portfolio_id: portfolio.id,
            ticker: ticker.toUpperCase(),
            action: 'BUY',
            quantity,
            price,
            total_value: totalValue,
            rsi_at_trade: rsi,
            volume_trend: 'unknown',
            mistake_flags: JSON.stringify([autopsy])
          }
        });
      });
    } else if (action === 'SELL') {
      const holding = await prisma.holding.findFirst({
        where: { portfolio_id: portfolio.id, ticker: ticker.toUpperCase() }
      });

      if (!holding || holding.quantity < quantity) {
        return res.status(400).json({ error: `You don't hold enough ${ticker} shares.` });
      }

      await prisma.$transaction(async (tx) => {
        await tx.portfolio.update({
          where: { id: portfolio.id },
          data: { virtual_cash: { increment: totalValue } }
        });

        if (holding.quantity === quantity) {
          await tx.holding.delete({ where: { id: holding.id } });
        } else {
          await tx.holding.update({
            where: { id: holding.id },
            data: { quantity: { decrement: quantity } }
          });
        }

        const rsi = computeRSI(hist.map(h => h.close));
        const analyzer = new TradeAnalyzer(holding.avg_buy_price, price, rsi, 'unknown');
        const autopsy = analyzer.analyzeLoss();

        await tx.trade.create({
          data: {
            portfolio_id: portfolio.id,
            ticker: ticker.toUpperCase(),
            action: 'SELL',
            quantity,
            price,
            total_value: totalValue,
            rsi_at_trade: rsi,
            volume_trend: 'unknown',
            mistake_flags: JSON.stringify([autopsy])
          }
        });
      });
    }

    res.status(200).json({ message: 'Trade executed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

function computeRSI(prices: number[]) {
  let gains = 0, losses = 0;
  for (let i = 1; i < 15; i++) {
    const diff = prices[prices.length - i] - prices[prices.length - i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const rs = gains / (losses || 1);
  return 100 - (100 / (1 + rs));
}
