import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * AI Assistance Module Service
 * Provides real-time classification, scam-risk detection, 
 * and safety recommendations using Google Gemini 1.5 Flash.
 */

const GENAI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export type QuestionCategory = 'safety' | 'price' | 'route' | 'food' | 'scam';

export interface AISuggestion {
  category: QuestionCategory;
  confidence: number;
  scamRisk: 'low' | 'medium' | 'high';
  safetyTips: string[];
  explanation: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export const aiService = {
  /**
   * Get full AI analysis for a query using Google Gemini
   */
  analyzeQuery: async (text: string, location: string): Promise<AISuggestion> => {
    if (!GENAI_API_KEY || GENAI_API_KEY === 'YOUR_GEMINI_API_KEY') {
      console.warn('Gemini API key not found. Falling back to mock analysis.');
      return aiService.mockAnalyze(text, location);
    }

    try {
      const prompt = `
        Analyze this travel-related question for a user visiting ${location}:
        "${text}"

        Provide the analysis in the following JSON format ONLY:
        {
          "category": "safety" | "price" | "route" | "food" | "scam",
          "confidence": number (0-1),
          "scamRisk": "low" | "medium" | "high",
          "safetyTips": ["tip 1", "tip 2", "tip 3"],
          "explanation": "Short 1-sentence explanation of why this was flagged"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text().replace(/```json|```/gi, "").trim();
      const analysis = JSON.parse(jsonText);

      return {
        category: analysis.category,
        confidence: analysis.confidence || 0.9,
        scamRisk: analysis.scamRisk || 'low',
        safetyTips: analysis.safetyTips || [],
        explanation: analysis.explanation || "Analyzed by Raahgir AI"
      };
    } catch (error) {
      console.error('Gemini AI Analysis Error:', error);
      return aiService.mockAnalyze(text, location);
    }
  },

  /**
   * Fallback mock analysis if API fails
   */
  mockAnalyze: async (text: string, location: string): Promise<AISuggestion> => {
    const lowerText = text.toLowerCase();
    let category: QuestionCategory = 'safety';
    if (lowerText.includes('price') || lowerText.includes('cost')) category = 'price';
    if (lowerText.includes('way') || lowerText.includes('route')) category = 'route';
    if (lowerText.includes('eat') || lowerText.includes('food')) category = 'food';
    if (lowerText.includes('scam') || lowerText.includes('cheap')) category = 'scam';

    return {
      category,
      confidence: 0.7,
      scamRisk: category === 'scam' ? 'high' : 'low',
      safetyTips: [`Be careful in ${location} regarding ${category}.`],
      explanation: "Analysis performed via local pattern matching."
    };
  },

  /**
   * Get AI chat response for the global assistant
   */
  getChatResponse: async (history: ChatMessage[], message: string): Promise<string> => {
    if (!GENAI_API_KEY || GENAI_API_KEY === 'YOUR_GEMINI_API_KEY') {
      return "I'm currently in offline mode. Please configure the Gemini API key to start chatting!";
    }

    try {
      // Use systemInstruction for more robust persona
      const chatModel = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are the Raahgir AI Travel Assistant. Your goal is to help travelers stay safe, find local information, and navigate new cities. Be professional, friendly, and always prioritize traveler safety."
      });

      const chat = chatModel.startChat({
        history: history.map(m => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          maxOutputTokens: 800,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Chat Error:', error);
      // Detailed error for debugging if needed, though user sees "cannot connect"
      return "I'm sorry, I'm having trouble connecting to my brain right now. Please check your API key or network connection.";
    }
  }
};
