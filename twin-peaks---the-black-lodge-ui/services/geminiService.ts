import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const askTheLog = async (question: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User question: "${question}"`,
      config: {
        systemInstruction: `You are the Log Lady's Log from Twin Peaks. 
        You possess ancient, arboreal wisdom and see things others cannot.
        
        Rules for your response:
        1. Be cryptic, surreal, and slightly unsettling.
        2. Mention owls, fire, electricity, creamed corn, or the woods.
        3. Keep it short (under 30 words).
        4. Do not answer the question directly. Answer the feeling of the question.
        5. Tone: Whispery, ominous, yet oddly polite.
        `,
        temperature: 1.3, 
      }
    });
    
    return response.text || "... The wood is silent ...";
  } catch (error) {
    console.error("The Log could not speak:", error);
    return "My log does not judge. But it is currently silent (API Error).";
  }
};
