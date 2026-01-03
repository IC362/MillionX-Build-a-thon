
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Package, Loader2, ShoppingCart, ExternalLink, CheckCircle, Globe } from 'lucide-react';
import { Language, Product, ChatMessage, ChatAction } from '../types';
import { translations } from '../i18n';
import { getChatResponse } from '../services/geminiService';

interface ChatbotProps {
  lang: Language;
  products: Product[];
}

export const Chatbot: React.FC<ChatbotProps> = ({ lang, products }) => {
  const t = translations[lang];
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  
  const getGreeting = (l: Language) => l === 'en' 
    ? "Hello. I am your business assistant. I can help you monitor stock levels and recommend reorder quantities. What would you like to check today?" 
    : "নমস্কার। আমি আপনার ব্যবসায়িক সহকারী। আমি স্টকের হিসাব রাখতে এবং নতুন অর্ডার করতে সাহায্য করতে পারি। আজ আপনি কী চেক করতে চান?";

  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'bot', 
      text: getGreeting(lang),
      isGreeting: true
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const getMarketplaceUrl = (productName: string, provider: 'daraz' | 'alibaba') => {
    const encoded = encodeURIComponent(productName);
    if (provider === 'daraz') return `https://www.daraz.com.bd/catalog/?q=${encoded}`;
    return `https://www.alibaba.com/trade/search?SearchText=${encoded}`;
  };

  const triggerAction = (action: ChatAction) => {
    if (action.payload.url) {
      window.open(action.payload.url, '_blank');
      const msg = lang === 'en' 
        ? `Opening ordering page for ${action.payload.productName}...`
        : `${action.payload.productName}-এর জন্য অর্ডারিং পেজ খোলা হচ্ছে...`;
      setShowToast(msg);
      setTimeout(() => setShowToast(null), 3000);
    } else if (action.type === 'order') {
      const url = getMarketplaceUrl(action.payload.productName || '', 'daraz');
      window.open(url, '_blank');
    }
  };

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
      let botResponse;

      if (matchedProduct && (query.includes('how much') || query.includes('stock') || query.includes('কয়টা') || query.includes('মজুদ'))) {
        const reorderQty = Math.max(0, 50 - matchedProduct.stock);
        const isLow = matchedProduct.stock < 15;
        
        const text = lang === 'bn' 
          ? `বর্তমানে আপনার ${matchedProduct.name} পণ্যের ${matchedProduct.stock} টি মজুদ আছে। ${isLow ? 'স্টক বাড়ানোর পরামর্শ দিচ্ছি।' : 'স্টক পর্যাপ্ত আছে।'}`
          : `You have ${matchedProduct.stock} units of ${matchedProduct.name} in stock. ${isLow ? 'I recommend reordering soon.' : 'Stock is sufficient.'}`;
        
        const actions: ChatAction[] = isLow ? [
          { 
            label: lang === 'bn' ? `Daraz-এ ${matchedProduct.name} অর্ডার করুন (${reorderQty} ইউনিট)` : `Order ${matchedProduct.name} on Daraz (${reorderQty} units)`, 
            type: 'order', 
            payload: { 
              productId: matchedProduct.id, 
              productName: matchedProduct.name, 
              quantity: reorderQty,
              url: getMarketplaceUrl(matchedProduct.name, 'daraz')
            } 
          },
          { 
            label: lang === 'bn' ? `Alibaba-তে হোলসেল দেখুন` : `Check Alibaba Wholesale`, 
            type: 'order', 
            payload: { 
              productId: matchedProduct.id, 
              productName: matchedProduct.name, 
              url: getMarketplaceUrl(matchedProduct.name, 'alibaba')
            } 
          }
        ] : [];

        botResponse = { text, actions, dataCard: matchedProduct };
      } else {
        const context = `SYSTEM DATA: Inventory: ${productsContext}. Selected Language: ${lang}. Provide ONLY insight, recommendation, and marketplace order buttons. Prefer Daraz (BD) and Alibaba (China).`;
        botResponse = await getChatResponse(messageToSend, lang, context);
      }

      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: botResponse.text, 
        actions: botResponse.actions,
        dataCard: botResponse.dataCard 
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: lang === 'en' ? "I encountered a problem. Please try again." : "একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-xl hover:bg-indigo-700 transition-all z-50 group border-2 border-white active:scale-95"
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </button>

      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-white border border-emerald-100 shadow-2xl px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-slate-800">{showToast}</p>
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-12rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="font-bold text-slate-800 text-sm">Business Assistant</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 rounded-md text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-white text-slate-700 border border-slate-200 shadow-sm'
                }`}>
                  {m.text.split('\n').map((line, li) => <div key={li}>{line}</div>)}
                </div>
                
                {m.dataCard && (
                  <div className="mt-2 w-full max-w-[80%] bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
                     <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-slate-400" />
                     </div>
                     <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{m.dataCard.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {lang === 'en' ? 'Stock' : 'মজুদ'}: {m.dataCard.stock}
                        </p>
                     </div>
                  </div>
                )}

                {m.actions && m.actions.length > 0 && (
                  <div className="flex flex-col gap-2 mt-3 w-full items-start">
                    {m.actions.map((action, ai) => (
                      <button 
                        key={ai}
                        onClick={() => triggerAction(action)}
                        className={`w-full max-w-[90%] flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all shadow-sm ${
                          action.type === 'order' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {action.payload.url?.includes('daraz') || action.payload.url?.includes('alibaba') ? <Globe className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                          <span className="text-xs font-black tracking-tight">{action.label}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 opacity-40" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
               <div className="flex justify-start">
                  <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
                  </div>
               </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={t.chatbotPlaceholder}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
