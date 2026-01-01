
import { GoogleGenAI, Type } from "@google/genai";
import { SaleRecord, InteractionRecord, AIAnalysisResult } from "../types";

// Correctly initialize GoogleGenAI with a named parameter using process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getContextStrings = (sales: any, interactions: any) => {
  const salesSummary = typeof sales === 'string' 
    ? sales 
    : Array.isArray(sales) ? sales.map((s: any) => `${s.date}: $${s.amount}`).join(', ') : JSON.stringify(sales);
  
  const interactionSummary = typeof interactions === 'string'
    ? interactions
    : Array.isArray(interactions) ? interactions.map((i: any) => `${i.timestamp} (${i.sentiment}): ${i.query}`).join(', ') : JSON.stringify(interactions);

  return { salesSummary, interactionSummary };
};

export const getAIInsights = async (
  sales: SaleRecord[] | string,
  interactions: InteractionRecord[] | string,
  language: 'en' | 'bn' = 'en'
): Promise<AIAnalysisResult> => {
  const { salesSummary, interactionSummary } = getContextStrings(sales, interactions);

  const languageInstruction = language === 'bn' 
    ? "Please provide the summary, anomalies, and recommendations in Bangla language. The forecast dates should be strings like YYYY-MM-DD." 
    : "Please provide everything in English.";

  const prompt = `Analyze this e-commerce SME data:
  Recent Sales Data: ${salesSummary}
  Customer Interaction Data: ${interactionSummary}
  
  Please identify:
  1. A brief executive summary of performance.
  2. Any clear anomalies (spikes or drops) found in the provided records.
  3. Actionable business recommendations tailored to this specific input.
  4. A simple daily forecast for the next 5 days based on trends.
  
  ${languageInstruction}
  Format the response strictly as a JSON object with the keys: summary (string), anomalies (array of strings), recommendations (array of strings), and forecast (array of objects with date and predictedValue).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          anomalies: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          recommendations: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          forecast: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                predictedValue: { type: Type.NUMBER }
              },
              required: ["date", "predictedValue"]
            }
          }
        },
        required: ["summary", "anomalies", "recommendations", "forecast"]
      }
    }
  });

  // Extract text using the .text property as required by guidelines.
  const jsonStr = response.text || '{}';
  return JSON.parse(jsonStr);
};

export const followUpChat = async (
  sales: any,
  interactions: any,
  question: string,
  history: { role: 'user' | 'model', text: string }[],
  language: 'en' | 'bn' = 'en'
): Promise<string> => {
  const { salesSummary, interactionSummary } = getContextStrings(sales, interactions);
  const languageInstruction = language === 'bn' ? "Respond in Bangla." : "Respond in English.";

  const systemInstruction = `You are a SME Business Expert. You have access to this data:
  Sales: ${salesSummary}
  Interactions: ${interactionSummary}
  Answer user questions based strictly on this data and general e-commerce expertise. ${languageInstruction}`;

  // Use ai.chats.create for chat interactions according to guidelines.
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction,
    },
  });

  // Inject history into the chat state.
  if (history && history.length > 0) {
    (chat as any).history = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));
  }

  const response = await chat.sendMessage({ message: question });

  return response.text || "No response generated.";
};

export const getActionPlan = async (
  recommendation: string,
  language: 'en' | 'bn' = 'en'
): Promise<string> => {
  const languageInstruction = language === 'bn' ? "Provide the plan in Bangla." : "Provide the plan in English.";
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on this recommendation: "${recommendation}", provide a 3-step detailed action plan for an SME owner. ${languageInstruction}`,
  });

  return response.text || "";
};
