
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Package, ShoppingCart, ExternalLink, RefreshCw } from 'lucide-react';
import { Language, Product } from '../types';
import { translations } from '../i18n';
import { getChatResponse } from '../services/geminiService';

interface ChatbotProps {
  lang: Language;
  products: Product[];
}

interface Message {
  role: 'user' | 'bot';
  text: string;
  dataCard?: any;
  suggestions?: string[];
  isGreeting?: boolean;
}

export const Chatbot: React.FC<ChatbotProps> = ({ lang, products }) => {
  const t = translations[lang];
  const [isOpen, setIsOpen] = useState(false);
  
  const getGreeting = (l: Language) => l === 'en' 
    ? "I'm connected to your inventory. Ask me things like 'How much stock do I have for Smartwatch?' or 'Which items are low?'" 
    : "আমি আপনার পণ্যের তালিকার সাথে সংযুক্ত আছি। আমাকে জিজ্ঞাসা করুন 'আমার স্মার্টওয়াচ এর কতগুলো মজুদ আছে?' অথবা 'কোন পণ্যগুলো ফুরিয়ে যাচ্ছে?'";

  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'bot', 
      text: getGreeting(lang),
      isGreeting: true
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update greeting if language changes and it's the only message
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].isGreeting) {
        return [{ 
          role: 'bot', 
          text: getGreeting(lang),
          isGreeting: true 
        }];
      }
      return prev;
    });
  }, [lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (overrideText?: string) => {
    const messageToSend = overrideText || input;
    if (!messageToSend.trim() || loading) return;

    const query = messageToSend.toLowerCase();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: messageToSend }]);
    setLoading(true);

    const productsContext = products.map(p => `${p.name}: ${p.stock} units (Price: $${p.price})`).join(', ');

    try {
      const matchedProduct = products.find(p => query.includes(p.name.toLowerCase()));
      
      let responseText = "";
      let dataCard = null;
      let suggestions: string[] = [];

      // Local heuristic for common inventory queries to ensure zero-latency accurate data
      if (matchedProduct && (query.includes('how much') || query.includes('stock') || query.includes('কয়টা') || query.includes('মজুদ'))) {
        const health = matchedProduct.stock < 10 ? 'Critical' : matchedProduct.stock < 20 ? 'Low' : 'Healthy';
        
        if (lang === 'bn') {
          responseText = `বর্তমানে আপনার ${matchedProduct.name} পণ্যের ${matchedProduct.stock} ইউনিট স্টকে আছে। এই পরিমাণটি ${health === 'Critical' ? 'খুবই কম' : health === 'Low' ? 'কম' : 'পর্যাপ্ত'} হিসেবে চিহ্নিত করা হয়েছে।`;
          if (matchedProduct.stock < 20) {
            responseText += `\nসতর্কতা: ${matchedProduct.name} পণ্যের স্টক প্রায় শেষ। এখন অর্ডার না করলে বিক্রি হারানোর সম্ভাবনা আছে।`;
          }
        } else {
          responseText = `You currently have ${matchedProduct.stock} units of ${matchedProduct.name} in stock. This level is considered ${health}.`;
          if (matchedProduct.stock < 20) {
            responseText += `\nWarning: Stock for ${matchedProduct.name} is nearly finished. Reorder soon to avoid losing sales.`;
          }
        }
        
        dataCard = matchedProduct;
        suggestions = lang === 'bn' ? ['নতুন স্টক অর্ডার করুন', 'সাপ্লায়ার দেখুন'] : ['Reorder Now', 'View Suppliers'];
      } else {
        const context = `SYSTEM DATA: You have the following inventory: ${productsContext}. 
        IMPORTANT: The user is currently browsing in ${lang === 'bn' ? 'Bangla' : 'English'}. YOU MUST RESPOND IN ${lang === 'bn' ? 'BANGLA' : 'ENGLISH'}.
        If a user asks for stock, give the exact number from the system data.
        Use shopkeeper-friendly terminology.`;
        responseText = await getChatResponse(messageToSend, lang, context);
      }

      setMessages(prev => [...prev, { role: 'bot', text: responseText, dataCard, suggestions }]);
    } catch (err) {
      console.error(err);
      const errorMsg = lang === 'en' ? "Sorry, I encountered an error. Please try again." : "দুঃখিত, একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।";
      setMessages(prev => [...prev, { role: 'bot', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-300 hover:scale-105 active:scale-95 transition-all z-50 group border-4 border-white"
      >
        <MessageSquare className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-12rem)] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          <div className="p-5 bg-indigo-600 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/30">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <p className="font-black text-lg">TrackSmart AI</p>
                <div className="flex items-center gap-2">
                   <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                   <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">
                     {lang === 'en' ? 'Inventory Aware' : 'ইনভেন্টরি সচেতন'}
                   </span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none font-medium shadow-md' 
                    : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none font-medium'
                }`}>
                  {m.text.split('\n').map((line, li) => <div key={li}>{line}</div>)}
                </div>
                
                {m.dataCard && (
                  <div className="mt-3 w-full max-w-[80%] bg-white border border-indigo-100 rounded-2xl p-4 shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                     <div className={`p-2 rounded-xl ${m.dataCard.stock < 10 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                        <Package className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-xs font-black text-slate-800">{m.dataCard.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {lang === 'en' ? 'Stock' : 'মজুদ'}: {m.dataCard.stock} • ${m.dataCard.price}
                        </p>
                     </div>
                  </div>
                )}

                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {m.suggestions.map((s, si) => (
                      <button 
                        key={si}
                        onClick={() => handleSend(s)}
                        className="px-3 py-1.5 bg-white border border-indigo-200 rounded-full text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
               <div className="flex justify-start">
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                  </div>
               </div>
            )}
          </div>

          <div className="p-5 bg-white border-t border-slate-100 flex gap-3 shrink-0">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={t.chatbotPlaceholder}
              className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
