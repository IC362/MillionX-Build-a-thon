
import React from 'react';
import { AlertTriangle, TrendingUp, Sparkles, ArrowRight, Package, DollarSign } from 'lucide-react';
import { Language, Product } from '../types';
import { translations } from '../i18n';

interface AlertCenterProps {
  lang: Language;
  products: Product[];
  onAction: (productId: string) => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({ lang, products, onAction }) => {
  const t = translations[lang];

  const stockAlerts = products.filter(p => p.stock < 15).sort((a,b) => a.stock - b.stock);
  const demandAlerts = products.filter(p => p.demandLevel === 'High');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-2xl font-black text-slate-800">{t.alertCenter}</h3>
        <p className="text-slate-500 mt-1">Critical issues and opportunities requiring your immediate attention.</p>
      </div>

      <div className="space-y-6">
        <h4 className="font-black text-sm uppercase text-rose-500 tracking-widest flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {lang === 'en' ? 'Critical Stock Warnings' : 'গুরুত্বপূর্ণ মজুদ সতর্কতা'}
        </h4>
        {stockAlerts.length === 0 ? (
          <div className="bg-white border border-slate-100 p-8 rounded-2xl text-center">
            <p className="text-slate-400 font-bold italic">No critical stock issues detected.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {stockAlerts.map(p => (
              <div key={p.id} className="bg-white border-l-4 border-l-rose-500 border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-lg">{p.name}</h5>
                    <p className="text-sm text-slate-500">
                      {lang === 'en' 
                        ? `Only ${p.stock} units remaining. Running out soon!` 
                        : `মাত্র ${p.stock} টি মজুদ আছে। দ্রুত ফুরিয়ে যাচ্ছে!`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onAction(p.id)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all group"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {t.takeAction}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h4 className="font-black text-sm uppercase text-amber-500 tracking-widest flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          {lang === 'en' ? 'Market Opportunities' : 'বাজারের সুযোগ'}
        </h4>
        {demandAlerts.map(p => (
          <div key={p.id} className="bg-white border-l-4 border-l-amber-500 border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 text-lg">{p.name}</h5>
                <p className="text-sm text-slate-500">
                  {lang === 'en' 
                    ? `This product is currently trending in your region. Consider increasing price or stock.` 
                    : `এই পণ্যটি আপনার এলাকায় এখন জনপ্রিয়। দাম বা মজুদ বাড়ানোর কথা ভাবুন।`}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onAction(p.id)}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all group shadow-lg shadow-indigo-100"
            >
              <Sparkles className="w-4 h-4 text-white" />
              AI Strategy
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-center">
         <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">
           {lang === 'en' 
             ? "এই প্রোটোটাইপে আমরা রুল-ভিত্তিক AI ব্যবহার করেছি, কিন্তু আর্কিটেকচার রিয়েল ডেটার জন্য প্রস্তুত।" 
             : "এই প্রোটোটাইপে আমরা রুল-ভিত্তিক AI ব্যবহার করেছি, কিন্তু আর্কিটেকচার রিয়েল ডেটার জন্য প্রস্তুত।"}
         </p>
      </div>
    </div>
  );
};
