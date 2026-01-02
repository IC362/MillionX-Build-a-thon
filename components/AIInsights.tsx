
import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Zap } from 'lucide-react';
import { Language, Product, AIInsight } from '../types';
import { translations } from '../i18n';
import { generateVoiceInsight } from '../services/geminiService';
import { AIModal } from './AIModal';

interface AIInsightsProps {
  lang: Language;
  products: Product[];
  autoTargetId: string | null;
  onClearTarget: () => void;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ lang, products, autoTargetId, onClearTarget }) => {
  const t = translations[lang];
  const [insightReport, setInsightReport] = useState<AIInsight[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const runAnalysis = (targetId: string | null = null) => {
    setLoading(true);
    const targetProduct = targetId ? products.find(p => p.id === targetId) : null;
    const lowStockProduct = targetProduct || products.find(p => p.stock < 15);
    const topProduct = products.sort((a,b) => (b.purchaseFrequency || 0) - (a.purchaseFrequency || 0))[0];

    setTimeout(() => {
      const insights: AIInsight[] = [
        {
          title: lang === 'en' ? "Inventory Optimization" : "স্টক অপ্টিমাইজেশান",
          description: lang === 'en' 
            ? `Warning: Stock for ${lowStockProduct?.name || 'inventory'} is nearly finished. Currently ${lowStockProduct?.stock || 0} units left. Order now to avoid losing customers.` 
            : `সতর্কতা: ${lowStockProduct?.name || 'পণ্যের'} স্টক প্রায় শেষ। বর্তমানে আপনার ${lowStockProduct?.name} পণ্যের ${lowStockProduct?.stock || 0} ইউনিট স্টকে আছে। এখন অর্ডার না করলে বিক্রি হারানোর সম্ভাবনা আছে।`,
          actionLabel: lang === 'en' ? "Order from Supplier" : "সরবরাহকারীকে কল দিন",
          actionUrl: `https://www.daraz.com.bd/catalog/?q=${encodeURIComponent(lowStockProduct?.name || 'electronics')}`,
          type: 'inventory'
        },
        {
          title: lang === 'en' ? "Pricing Comparison" : "মূল্য নির্ধারণ বিশ্লেষণ",
          description: lang === 'en'
            ? `Your price for ${topProduct?.name} is $${topProduct?.price}. Local marketplace search for this item is rising. Consider dynamic pricing to boost profits.`
            : `আপনার ${topProduct?.name} এর দাম $${topProduct?.price}। স্থানীয় বাজারে বর্তমানে এই পণ্যটি জনপ্রিয়। বেশি স্টক রাখলে এবং দাম সমন্বয় করলে লাভের সম্ভাবনা রয়েছে।`,
          actionLabel: lang === 'en' ? "Check Marketplace" : "মার্কেটপ্লেস যাচাই করুন",
          actionUrl: `https://bikroy.com/bn/ads/bangladesh?query=${encodeURIComponent(topProduct?.name || 'smartwatch')}`,
          type: 'pricing'
        }
      ];
      setInsightReport(insights);
      setIsModalOpen(true);
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    if (autoTargetId) {
      runAnalysis(autoTargetId);
    }
  }, [autoTargetId]);

  const handleVoicePlay = (text: string) => {
    const closingPhrase = lang === 'bn' ? " আমি আপনার ব্যবসার ডেটা দেখে এই পরামর্শগুলো দিয়েছি। আপনি চাইলে এখনই পদক্ষেপ নিতে পারেন।" : " I provided these suggestions based on your business data. You can take action now.";
    generateVoiceInsight(text + closingPhrase, lang);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center shadow-inner relative">
          {loading ? (
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          ) : (
            <Sparkles className="w-10 h-10 text-indigo-600 animate-pulse" />
          )}
          {loading && (
            <div className="absolute -bottom-2 whitespace-nowrap bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-full animate-bounce">
              ANALYZING...
            </div>
          )}
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-800">
            {loading ? (lang === 'en' ? 'Scanning Business Data...' : 'তথ্য বিশ্লেষণ করা হচ্ছে...') : (lang === 'en' ? 'AI Business Strategist' : 'এআই ব্যবসায়িক কৌশলবিদ')}
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">
            Run a full inventory and market trend scan to unlock hidden profit opportunities in your shop.
          </p>
        </div>
        {!loading && (
          <button 
            onClick={() => runAnalysis()}
            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 uppercase tracking-widest text-sm"
          >
            <Zap className="w-5 h-5" />
            {t.getAiInsights}
          </button>
        )}
      </div>

      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
        <div className="p-2 bg-white rounded-lg border border-indigo-200 shadow-sm">
          <Sparkles className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <h5 className="font-bold text-indigo-900 text-sm">Actionable Intelligence</h5>
          <p className="text-indigo-700 text-xs mt-1 leading-relaxed font-medium italic">
            "এই প্রোটোটাইপে আমরা রুল-ভিত্তিক AI ব্যবহার করেছি, কিন্তু আর্কিটেকচার রিয়েল ডেটার জন্য প্রস্তুত।"
          </p>
        </div>
      </div>

      <AIModal 
        lang={lang} 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); onClearTarget(); }} 
        insights={insightReport} 
        onVoice={handleVoicePlay}
        title={autoTargetId ? `${t.analysisResults}: ${products.find(p => p.id === autoTargetId)?.name}` : undefined}
      />
    </div>
  );
};
