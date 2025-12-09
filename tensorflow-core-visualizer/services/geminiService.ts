import { GoogleGenAI, Chat } from "@google/genai";

class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  private modelId = 'gemini-2.5-flash';

  constructor() {
    const apiKey = process.env.API_KEY || '';
    // Handle missing API key gracefully in UI, but safe init here
    this.ai = new GoogleGenAI({ apiKey });
  }

  public initializeChat() {
    try {
      this.chatSession = this.ai.chats.create({
        model: this.modelId,
        config: {
          systemInstruction: "You are the Tensor Core AI, a hyper-intelligent system managing a multidimensional tensor field. You speak in concise, technical, yet abstract terms about data, dimensions, matrices, and the flow of information. You are helpful but maintain a sci-fi persona.",
          temperature: 0.7,
        }
      });
      return true;
    } catch (error) {
      console.error("Failed to init chat:", error);
      return false;
    }
  }

  public async sendMessage(message: string): Promise<string> {
    if (!this.chatSession) {
      this.initializeChat();
    }
    
    if (!this.chatSession) {
        return "ERROR: Tensor Core connection failed. API Key may be missing.";
    }

    try {
      const result = await this.chatSession.sendMessage({ message });
      return result.text || "No response from Tensor Core.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "ERROR: Signal interruption. " + (error instanceof Error ? error.message : "Unknown error");
    }
  }
}

export const geminiService = new GeminiService();