import { GoogleGenerativeAI } from "@google/generative-ai";
import { Trade, Stock } from "../types";

export interface AIAnalysisResult {
  analysis: string;
  flags: string;
}

/**
 * Strips markdown code blocks (e.g. ```json ... ```) from LLM output before parsing.
 */
function cleanJsonOutput(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/**
 * Analyzes a trade using the backend proxy endpoint if available,
 * with graceful fallback to direct Gemini client-side generation.
 */
export async function analyzeTrade(
  trade: Partial<Trade>,
  stock: Stock
): Promise<AIAnalysisResult> {
  const payload = {
    ticker: stock.ticker,
    name: stock.name,
    price: stock.price,
    action: trade.action || 'BUY',
    quantity: trade.quantity || 0,
    total_value: trade.total_value || 0,
  };

  // 1. Attempt backend proxy analysis (keeps API key secure on server)
  try {
    const res = await fetch('/api/ai/analyze-trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data: AIAnalysisResult = await res.json();
      if (data.analysis) {
        return {
          analysis: data.analysis,
          flags: data.flags || 'None',
        };
      }
    }
  } catch {
    // Backend unavailable, fallback to client-side evaluation
  }

  // 2. Client-side fallback with robust markdown code-block parsing
  try {
    const apiKey = (import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      '') as string;

    if (!apiKey || apiKey === 'dummy_key') {
      return getRuleBasedAnalysis(trade, stock);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      Analyze this paper trade for a student learning the stock market:
      Stock: ${stock.ticker} (${stock.name})
      Current Price: ₹${stock.price}
      Action: ${trade.action}
      Quantity: ${trade.quantity}
      Total Value: ₹${trade.total_value}
      
      Provide a brief, encouraging analysis (max 3 sentences) explaining why this might be a good or risky move for a beginner. 
      Also, identify any "mistake flags" (e.g., FOMO, lack of diversification, over-leveraging) if applicable.
      
      Return the response in strictly valid JSON format:
      {
        "analysis": "Your 2-3 sentence analysis here.",
        "flags": "Comma separated flags or 'None'"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const sanitized = cleanJsonOutput(text || '{}');
    const data = JSON.parse(sanitized || '{}');

    return {
      analysis: data.analysis || 'Trade executed successfully. Keep learning!',
      flags: data.flags || 'None',
    };
  } catch (error) {
    console.warn('Client-side AI analysis fallback triggered:', error);
    return getRuleBasedAnalysis(trade, stock);
  }
}

function getRuleBasedAnalysis(trade: Partial<Trade>, stock: Stock): AIAnalysisResult {
  const total = trade.total_value || 0;
  if (total > 50000) {
    return {
      analysis: `Placing ₹${total.toLocaleString('en-IN')} on a single stock is aggressive for learning. Consider diversifying your virtual capital.`,
      flags: 'High Capital Allocation',
    };
  }

  if (trade.action === 'BUY') {
    return {
      analysis: `Entered ${stock.ticker} at ₹${stock.price.toFixed(2)}. Practice setting stop-loss and take-profit targets.`,
      flags: 'None',
    };
  }

  return {
    analysis: `Executed sell order for ${stock.ticker}. Review your trade outcome against your entry strategy.`,
    flags: 'None',
  };
}
