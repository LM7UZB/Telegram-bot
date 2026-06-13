import { GoogleGenAI } from "@google/genai";

// API kalit Vite tomonidan build vaqtida process.env.API_KEY ga joylanadi
// (vite.config.ts -> define). Kalit bo'lmasa ilova qulamasligi uchun
// klientni faqat kerak bo'lganda (lazy) ishga tushiramiz.
let ai: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  if (ai) return ai;
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API kaliti topilmadi (GEMINI_API_KEY). AI yordamchisi o'chirilgan.");
    return null;
  }
  ai = new GoogleGenAI({ apiKey });
  return ai;
}

export class GeminiService {
  /**
   * Zargarlik bo'yicha maslahat oladi.
   */
  async getJewelryAdvice(prompt: string): Promise<string> {
    const client = getClient();
    if (!client) {
      return "AI yordamchisi hozircha sozlanmagan (API kaliti yo'q).";
    }
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: "You are a professional jewelry expert for TillaBazar. Answer user questions about gold purity, gemstones, jewelry care, and market trends in a helpful and luxurious tone. Keep responses concise.",
          temperature: 0.7,
        },
      });
      return response.text || "Kechirasiz, so'rovingizni qayta ishlay olmadim.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Hozircha bilimlar bazasiga ulanishda muammo bor.";
    }
  }
}

export const geminiService = new GeminiService();
