
import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const fetchTechDescription = async (techName: string): Promise<string> => {
  if (!apiKey) {
    return "API KEY MISSING. PLEASE CONFIGURE ENV VARIABLES TO ESTABLISH UPLINK.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain the technology "${techName}" using cyberpunk slang and futuristic terminology (e.g., 'neural link', 'matrix', 'nodes', 'cycles'). Keep it technical but flavorful. Max 40 words.`,
    });
    
    return response.text?.trim() || "DATA CORRUPTION DETECTED. RETRYING...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "CRITICAL FAILURE: EXTERNAL NODE UNREACHABLE.";
  }
};

export const fetchTechAudio = async (text: string): Promise<string | null> => {
    if (!apiKey) return null;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' fits the sci-fi theme well
                    },
                },
            },
        });
        
        // Return base64 string of raw PCM
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (error) {
        console.error("Gemini TTS Error:", error);
        return null;
    }
};
