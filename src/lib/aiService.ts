/**
 * AI Assistance Module Service
 * Provides functions for question classification, scam-risk detection, 
 * and safety recommendations as per FR29-FR33.
 */

export type QuestionCategory = 'safety' | 'price' | 'route' | 'food' | 'scam';

export interface AISuggestion {
  category: QuestionCategory;
  confidence: number;
  scamRisk: 'low' | 'medium' | 'high';
  safetyTips: string[];
}

const SCAM_KEYWORDS = ['cheap', 'offer', 'win', 'lottery', 'free', 'urgent', 'exclusive', 'secret', 'hidden charge', 'no receipt'];
const SAFETY_KEYWORDS = ['safe', 'danger', 'night', 'alone', 'crime', 'police', 'hospital', 'watch out'];
const PRICE_KEYWORDS = ['cost', 'price', 'expensive', 'cheap', 'budget', 'how much', 'fare', 'taxi'];
const ROUTE_KEYWORDS = ['way', 'road', 'how to get', 'train', 'bus', 'flight', 'direction', 'map', 'distance'];
const FOOD_KEYWORDS = ['eat', 'restaurant', 'street food', 'tasty', 'vegan', 'halal', 'menu', 'dish'];

export const aiService = {
  /**
   * Automatically classify a question into a category (FR29)
   */
  classifyQuestion: (text: string): QuestionCategory => {
    const lowerText = text.toLowerCase();
    
    if (SCAM_KEYWORDS.some(k => lowerText.includes(k))) return 'scam';
    if (SAFETY_KEYWORDS.some(k => lowerText.includes(k))) return 'safety';
    if (PRICE_KEYWORDS.some(k => lowerText.includes(k))) return 'price';
    if (ROUTE_KEYWORDS.some(k => lowerText.includes(k))) return 'route';
    if (FOOD_KEYWORDS.some(k => lowerText.includes(k))) return 'food';
    
    return 'safety'; // Default
  },

  /**
   * Detect scam-risk patterns from queries (FR30)
   */
  detectScamRisk: (text: string): 'low' | 'medium' | 'high' => {
    const lowerText = text.toLowerCase();
    const matches = SCAM_KEYWORDS.filter(k => lowerText.includes(k)).length;
    
    if (matches >= 3) return 'high';
    if (matches >= 1) return 'medium';
    return 'low';
  },

  /**
   * Generate AI safety tips based on city and category (FR31)
   */
  getSafetyTips: (location: string, category: QuestionCategory): string[] => {
    const tips: Record<QuestionCategory, string[]> = {
      'safety': [
        `Stay alert in crowded areas of ${location}.`,
        'Keep your belongings secure and avoid displaying valuables.',
        'Use reputable transportation services especially at night.'
      ],
      'price': [
        'Always ask for a receipt or formal price agreement.',
        'Compare prices across multiple vendors if possible.',
        'Be wary of offers that seem too good to be true.'
      ],
      'route': [
        'Download offline maps for the area.',
        'Stick to well-lit and busy roads.',
        'Inform someone of your intended route.'
      ],
      'food': [
        'Choose vendors with high customer turnover.',
        'Check for hygiene ratings where available.',
        'If it smells off, don\'t eat it.'
      ],
      'scam': [
        'WARNING: This query matches common scam patterns.',
        'Never share personal details or payment info with unverified individuals.',
        'Locals rarely approach tourists with "exclusive deals".'
      ]
    };

    return tips[category] || tips['safety'];
  },

  /**
   * Get full AI analysis for a query
   */
  analyzeQuery: async (text: string, location: string): Promise<AISuggestion> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const category = aiService.classifyQuestion(text);
    const scamRisk = aiService.detectScamRisk(text);
    const safetyTips = aiService.getSafetyTips(location, category);

    return {
      category,
      confidence: 0.85 + (Math.random() * 0.1),
      scamRisk,
      safetyTips
    };
  }
};
