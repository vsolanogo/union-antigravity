import { GoogleGenAI } from "@google/genai";
import { CosmicFact } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getCosmicFact = async (theme: string): Promise<CosmicFact> => {
  if (!apiKey) {
    return {
      topic: 'API Key Missing',
      fact: 'Please configure your Gemini API key to receive cosmic wisdom.'
    };
  }

  try {
    const prompt = `Tell me a single, mind-blowing scientific fact about ${theme}. Keep it under 20 words.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || "The universe is silent right now.";
    
    return {
      topic: theme,
      fact: text.trim(),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      topic: 'Communication Error',
      fact: 'Interstellar static received. Try again later.'
    };
  }
};
