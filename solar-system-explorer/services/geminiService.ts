import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generatePlanetFact = async (planetName: string): Promise<string> => {
  if (!apiKey) {
    return "API Key not configured. Please set your Gemini API Key to use AI features.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Tell me a fascinating, lesser-known scientific fact about the planet ${planetName}. 
    Keep it concise (under 50 words) and engaging. 
    Format the output as plain text.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Error fetching from Gemini:", error);
    return "Unable to contact the stars right now. Try again later.";
  }
};

export const askAstronomer = async (planetName: string, question: string): Promise<string> => {
    if (!apiKey) {
      return "API Key not configured.";
    }
  
    try {
      const model = 'gemini-2.5-flash';
      const prompt = `You are an expert astronomer. The user is asking about ${planetName}.
      Question: "${question}"
      Provide a helpful, accurate, and friendly answer suitable for a general audience. 
      Keep it under 100 words.`;
  
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
  
      return response.text || "The telescope is cloudy.";
    } catch (error) {
      console.error("Error fetching from Gemini:", error);
      return "Communication error with the observatory.";
    }
  };