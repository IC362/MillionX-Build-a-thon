
import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getChatResponse = async (message: string, lang: 'en' | 'bn', context: string) => {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: message,
    config: {
      systemInstruction: `You are a helpful SME business assistant for a shopkeeper in Bangladesh. 
      
      CURRENT LANGUAGE MODE: ${lang === 'bn' ? 'BANGLA' : 'ENGLISH'}.
      YOU MUST RESPOND EXCLUSIVELY IN ${lang === 'bn' ? 'BANGLA' : 'ENGLISH'}.
      
      CRITICAL GUIDELINES FOR BANGLA:
      1. Use simple, rural-shopkeeper friendly Bangla (avoid complex academic words).
      2. For stock queries, use this format: "বর্তমানে আপনার [Product Name] পণ্যের [Count] ইউনিট স্টকে আছে। এই পরিমাণটি [Status] হিসেবে চিহ্নিত করা হয়েছে।"
      3. For warnings: "সতর্কতা: [Product Name] পণ্যের স্টক প্রায় শেষ। এখন অর্ডার না করলে বিক্রি হারানোর সম্ভাবনা আছে।"
      4. For health insights: "আপনার ব্যবসায় বর্তমানে ইনভেন্টরি ব্যবস্থাপনায় সমস্যা দেখা যাচ্ছে। পরামর্শ: দ্রুত বিক্রিত পণ্যের জন্য আগাম অর্ডার পরিকল্পনা করুন।"
      5. Always be proactive and suggest actions like reordering or checking suppliers.
      
      Here is the current business context (Inventory Data): ${context}`,
    },
  });
  return (await model).text;
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

export const getMarketTrends = async (products: string[]) => {
  const prompt = `Research current market trends in Bangladesh for these products: ${products.join(', ')}. Provide demand levels (High, Medium, Low) and reasons.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return response.text;
};
