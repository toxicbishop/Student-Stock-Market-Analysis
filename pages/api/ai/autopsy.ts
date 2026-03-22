import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TradeAnalyzer } from '../../../src/lib/analyzer';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { ticker, action, entry_price, current_price, quantity, rsi, volume_trend } = req.body;

  try {
    const analyzer = new TradeAnalyzer(entry_price, current_price, rsi, volume_trend);
    const ruleBased = analyzer.analyzeLoss();
    const score = analyzer.getTradeQualityScore();

    const pnl = current_price - entry_price;
    const pnl_pct = (pnl / entry_price) * 100;

    let aiExplanation = '';

    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are an AI trading mentor inside TradeLab. Explain this trade in 3-4 simple sentences. 
        Stock: ${ticker}, Action: ${action}, Entry: ₹${entry_price}, Current: ₹${current_price}, P&L: ${pnl_pct.toFixed(1)}%, Quantity: ${quantity}, RSI: ${rsi}, Volume: ${volume_trend}.
        Keep it under 80 words. Refer to the student as "you". Focused on RSI and Volume logic.`;
        
        const result = await model.generateContent(prompt);
        aiExplanation = result.response.text();
      } catch (e: any) {
        aiExplanation = `Your trade showed an RSI of ${rsi.toFixed(0)} with ${volume_trend} volume. ${ruleBased.lesson} ${ruleBased.fix}`;
      }
    } else {
      aiExplanation = `At the time of your trade, RSI was ${rsi.toFixed(0)} — ${rsi > 70 ? 'overbought territory' : 'neutral range'}. Volume was trending ${volume_trend}. ${ruleBased.fix}`;
    }

    res.status(200).json({
      rule_based: ruleBased,
      ai_explanation: aiExplanation,
      score,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
