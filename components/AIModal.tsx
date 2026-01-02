
import React from 'react';
import { X, Volume2, ExternalLink, ArrowRight, Download, FileText, FileCode, Sparkles } from 'lucide-react';
import { Language, AIInsight } from '../types';
import { translations } from '../i18n';

interface AIModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  insights: AIInsight[];
  onVoice: (text: string) => void;
  title?: string;
}

export const AIModal: React.FC<AIModalProps> = ({ lang, isOpen, onClose, insights, onVoice, title }) => {
  const t = translations[lang];

  if (!isOpen) return null;

  const exportAsReport = () => {
    const content = insights.map(i => `${i.title}\n${i.description}\nAction: ${i.actionLabel}\n---`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  const exportAsJson = () => {
    const blob = new Blob([JSON.stringify(insights, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Insights_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">{title || t.analysisResults}</h3>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Grounded Intelligence Report</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col justify-between group hover:border-indigo-200 transition-all hover:bg-white hover:shadow-xl">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={`p-2.5 rounded-xl ${
                      insight.type === 'pricing' ? 'bg-amber-100 text-amber-600' : 
                      insight.type === 'inventory' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <button onClick={() => onVoice(insight.description)} className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  <h5 className="text-lg font-black text-slate-800 leading-tight">{insight.title}</h5>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{insight.description}</p>
                </div>
                <a href={insight.actionUrl} target="_blank" rel="noreferrer" className="mt-8 flex items-center justify-between group/btn text-indigo-700 font-black text-xs bg-indigo-100/50 p-4 rounded-xl hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest">
                  <span className="flex items-center gap-2"><ExternalLink className="w-4 h-4" /> {insight.actionLabel}</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with Exports */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-medium italic">
            This report is based on your real-time inventory and market search data in Bangladesh.
          </p>
          <div className="flex items-center gap-3">
            <button onClick={exportAsReport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              {t.exportReport}
            </button>
            <button onClick={exportAsJson} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-wider">
              <FileCode className="w-4 h-4" />
              {t.exportJson}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
