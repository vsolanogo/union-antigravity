import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedGreeting } from "../types";

// Safe access to process.env for browser environments
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || '';
    }
  } catch (e) {
    // process is not defined
  }
  return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export const generateHolidayGreeting = async (theme: string): Promise<GeneratedGreeting> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Write a short, heartwarming Christmas or Holiday greeting card message based on the theme: "${theme}". 
    The tone should be magical and poetic.
    Return JSON.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            message: { type: Type.STRING }
          },
          required: ["title", "message"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as GeneratedGreeting;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      title: "Merry Christmas!",
      message: "May your days be merry and bright. (AI generation failed, please check API key)"
    };
  }
};