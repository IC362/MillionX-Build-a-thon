
import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Zap } from 'lucide-react';
import { Language, Product, Transaction, AIInsight } from '../types';
import { translations } from '../i18n';
import { generateVoiceInsight, getBusinessInsights } from '../services/geminiService';
import { AIModal } from './AIModal';

interface AIInsightsProps {
  lang: Language;
  products: Product[];
  transactions: Transaction[];
  autoTargetId: string | null;
  onClearTarget: () => void;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ lang, products, transactions, autoTargetId, onClearTarget }) => {
  const t = translations[lang];
  const [insightReport, setInsightReport] = useState<AIInsight[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async (targetId: string | null = null) => {
    setLoading(true);
    try {
      // Use the actual business data to generate real insights
      const insights = await getBusinessInsights(products, transactions, lang);
      setInsightReport(insights);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Analysis failed", err);
      // Fallback simple insight
      setInsightReport([{
        title: "System Error",
        description: "Could not generate insights at this moment.",
        type: 'inventory',
        actionLabel: "Try Again",
        actionUrl: "#"
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoTargetId) {
      runAnalysis(autoTargetId);
    }
  }, [autoTargetId]);

  const handleVoicePlay = (text: string) => {
    const closingPhrase = lang === 'bn' ? " আমি আপনার ব্যবসার ডেটা দেখে এই পরামর্শগুলো দিয়েছি।" : " I provided these suggestions based on your business data.";
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
            Run a deep scan on your sales history and stock levels to find growth opportunities.
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
            {lang === 'en' ? "Your actual CSV sales data is now being analyzed by our Gemini engine." : "আপনার CSV থেকে প্রাপ্ত বিক্রয় তথ্য এখন জেমিনি এআই দ্বারা বিশ্লেষণ করা হচ্ছে।"}
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
