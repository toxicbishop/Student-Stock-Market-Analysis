import { GoogleGenerativeAI } from "@google/generative-ai";
import { Trade, Stock } from "../types";

const genAI = new GoogleGenerativeAI((process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "dummy_key") as string);

export async function analyzeTrade(trade: Partial<Trade>, stock: Stock) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Analyze this paper trade for a student learning the stock market:
      Stock: ${stock.ticker} (${stock.name})
      Current Price: ₹${stock.price}
      Action: ${trade.action}
      Quantity: ${trade.quantity}
      Total Value: ₹${trade.totalValue}
      
      Provide a brief, encouraging analysis (max 3 sentences) explaining why this might be a good or risky move for a beginner. 
      Also, identify any "mistake flags" (e.g., FOMO, lack of diversification, over-leveraging) if applicable.
      
      Return the response in JSON format:
      {
        "analysis": "Your 2-3 sentence analysis here.",
        "flags": "Comma separated flags or 'None'"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const data = JSON.parse(text || '{}');

    return {
      analysis: data.analysis || "Trade executed successfully. Keep learning!",
      flags: data.flags || "None"
    };
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      analysis: "Trade executed. AI analysis is currently unavailable.",
      flags: "None"
    };
  }
}
