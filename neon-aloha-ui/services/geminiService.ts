import { GoogleGenAI } from "@google/genai";
import { ButtonEffectType } from "../types";

const PROMPTS = {
  [ButtonEffectType.WAIKIKI_WAVE]: "Give me a short, zen quote about surfing, ocean waves, or going with the flow.",
  [ButtonEffectType.VOLCANO_MAGMA]: "Give me a short, powerful quote about volcanoes, inner fire, or explosive energy.",
  [ButtonEffectType.TIKI_TORCH]: "Give me a short, spiritual quote about passion, torch light, or ancient spirits.",
  [ButtonEffectType.JUNGLE_MIST]: "Give me a short, mysterious quote about the jungle, silence, or nature's growth."
};

export const fetchHawaiiQuote = async (effect: ButtonEffectType): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API_KEY not found in environment variables");
      return "Aloha! (API Key missing)";
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = PROMPTS[effect] + " Maximum 15 words. Just the text, no quotes.";
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The spirit of Aloha is within you."; // Fallback
  }
};
