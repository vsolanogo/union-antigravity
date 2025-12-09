import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedGreeting } from "../types";

// Safe access to process.env for browser environments
const getApiKey = () => {
  try {
    // In Vite, process.env.API_KEY is replaced by string value. 
    // If not replaced, accessing process might throw, which is caught.
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

const FALLBACK_GREETINGS: GeneratedGreeting[] = [
  { title: "Merry Christmas!", message: "May the magic of the season fill your heart with joy and your home with warmth." },
  { title: "Happy Holidays!", message: "Wishing you peace, love, and laughter this holiday season and throughout the coming year." },
  { title: "Season's Greetings", message: "May your days be merry and bright, and your new year filled with light." },
  { title: "Winter Wishes", message: "Sending you warm wishes and holiday cheer found in the beauty of this winter season." },
  { title: "Joy to the World", message: "May this festive season sparkle and shine, may all of your wishes and dreams come true." }
];

const getRandomFallback = (): GeneratedGreeting => {
  return FALLBACK_GREETINGS[Math.floor(Math.random() * FALLBACK_GREETINGS.length)];
};

export const generateHolidayGreeting = async (theme: string): Promise<GeneratedGreeting> => {
  if (!apiKey) {
    console.warn("No API key found, returning fallback greeting.");
    return getRandomFallback();
  }

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
    return getRandomFallback();
  }
};