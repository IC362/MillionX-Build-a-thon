
import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBusinessInsights = async (products: any[], transactions: any[], lang: 'en' | 'bn') => {
  const salesSummary = transactions.slice(0, 50).map(t => {
    const p = products.find(prod => prod.id === t.productId);
    return `${p?.name || 'Item'}: sold ${t.quantity} on ${t.date.split('T')[0]}`;
  }).join('; ');

  const prompt = `Analyze the following inventory and sales activity for a shop in Bangladesh.
  Inventory: ${products.map(p => `${p.name} ($${p.price}, ${p.stock} units)`).join(', ')}
  Recent Activity: ${salesSummary}
  
  Provide exactly 2 high-value insights. Format as JSON: [{title: string, description: string, type: "inventory"|"pricing", actionLabel: string, actionUrl: string}].
  Respond in ${lang === 'bn' ? 'Bangla' : 'English'}. For description, mention specific sales drops or stock spikes if found.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING },
            actionLabel: { type: Type.STRING },
            actionUrl: { type: Type.STRING }
          },
          required: ["title", "description", "type", "actionLabel", "actionUrl"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const getChatResponse = async (message: string, lang: 'en' | 'bn', context: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: message,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "A minimalist, 2-sentence max response: [Insight]. [Recommendation]." },
          actions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "Button text: e.g. 'Order Product (Qty units)'" },
                type: { type: Type.STRING, enum: ["order", "view_supplier", "navigate"] },
                payload: {
                  type: Type.OBJECT,
                  properties: {
                    productId: { type: Type.STRING },
                    productName: { type: Type.STRING },
                    quantity: { type: Type.NUMBER },
                    url: { type: Type.STRING, description: "Direct marketplace URL or search URL (e.g. Daraz/Alibaba)" },
                    tab: { type: Type.STRING }
                  }
                }
              },
              required: ["label", "type", "payload"]
            }
          }
        },
        required: ["text"]
      },
      systemInstruction: `You are a minimalist business assistant for a shopkeeper in Bangladesh.
      
      STRICT RESPONSE FORMAT:
      1. One short insight sentence.
      2. One short recommendation sentence.
      3. Action buttons (if applicable).
      NO OTHER TEXT OR EMOJIS.
      
      ACTION BUTTON RULES:
      - If stock is low, return an 'order' action.
      - Use marketplace URLs for 'url':
        - Daraz: https://www.daraz.com.bd/catalog/?q=[ProductName]
        - Alibaba: https://www.alibaba.com/trade/search?SearchText=[ProductName]
      - Labels must be in ${lang === 'bn' ? 'Bangla' : 'English'}.
      
      CURRENT LANGUAGE: ${lang === 'bn' ? 'BANGLA' : 'ENGLISH'}.
      Context: ${context}`,
    },
  });
  
  try {
    return JSON.parse(response.text || '{"text": "I apologize, I could not process that."}');
  } catch (e) {
    return { text: response.text || "System Busy." };
  }
};

export const extractInvoiceData = async (base64Image: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
      {
        text: "Extract products from this invoice. Return JSON with format: [{name: string, category: string, price: number, quantity: number}]. Only return JSON.",
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            price: { type: Type.NUMBER },
            quantity: { type: Type.NUMBER },
          },
          required: ["name", "category", "price", "quantity"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const generateVoiceInsight = async (text: string, lang: 'en' | 'bn') => {
  const voiceName = lang === 'bn' ? 'Kore' : 'Zephyr';
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  }
};
