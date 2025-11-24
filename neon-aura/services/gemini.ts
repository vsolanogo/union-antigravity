import { GoogleGenAI, Type } from "@google/genai";
import { VibeAnalysis } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key not found. Using fallback response.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeImageVibe = async (base64Image: string): Promise<VibeAnalysis> => {
  try {
    const ai = getAiClient();

    if (!ai) {
      return {
        mood: "Cybernetic (Offline Mode)",
        color1: "#FF0099",
        color2: "#00FFDD",
        description: "API Key missing. Running in offline neon mode."
      };
    }

    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          },
          {
            text: "Analyze this image for a cyberpunk/synthwave neon edit. Identify the mood. Pick 2 high-contrast, ultra-vibrant neon hex colors (e.g. Hot Pink, Electric Blue, Acid Green) that would create a stunning electric aura. Return a creative 1-sentence description of the energy."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.STRING },
            color1: { type: Type.STRING, description: "Primary high-voltage neon color" },
            color2: { type: Type.STRING, description: "Secondary complementary neon color" },
            description: { type: Type.STRING, description: "Atmospheric description of the vibe" }
          },
          required: ["mood", "color1", "color2", "description"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as VibeAnalysis;
    }
    throw new Error("No text response from Gemini");

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      mood: "Cybernetic",
      color1: "#FF0099",
      color2: "#00FFDD",
      description: "Connection failed, initiating backup neon protocols."
    };
  }
};