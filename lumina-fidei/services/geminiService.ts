import { GoogleGenAI, Type } from "@google/genai";
import { ButtonVariant } from '../types';

// NOTE: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchDivineWisdom = async (variant: ButtonVariant): Promise<{ verse: string; interpretation: string }> => {
  let prompt = "";
  
  switch (variant) {
    case ButtonVariant.HALO:
      prompt = "Generate a short, uplifting Bible verse about light, hope, or glory, followed by a brief, modern philosophical interpretation of its meaning.";
      break;
    case ButtonVariant.PASSION:
      prompt = "Generate a short Bible verse about love, sacrifice, or the heart, followed by a brief, comforting interpretation.";
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verse: { type: Type.STRING },
            interpretation: { type: Type.STRING }
          },
          required: ["verse", "interpretation"]
        },
        systemInstruction: "You are a wise theologian and philosopher. Output JSON only."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from divine source.");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Divine wisdom fetch failed:", error);
    return {
      verse: "In the beginning was the Word...",
      interpretation: "The connection to the source is currently faint. Please try again later."
    };
  }
};