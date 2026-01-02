
import React, { useState } from 'react';
import { Package, Search, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Minus, Save, Sparkles, RefreshCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Language, Product } from '../types';
import { translations } from '../i18n';

interface ManageProductsProps {
  lang: Language;
  products: Product[];
  onUpdatePrice: (id: string, newPrice: number) => void;
}

export const ManageProducts: React.FC<ManageProductsProps> = ({ lang, products, onUpdatePrice }) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const getPricingLogic = (p: Product, currentPrice: number) => {
    // Sanity Checks - Extreme changes relative to "standard" base
    // Note: p.price in state is the "last saved" or initial price.
    const ratio = currentPrice / p.price;

    // 1. Extreme Price Hike Warning
    if (ratio > 2.0) {
      return {
        type: 'warning',
        desc: lang === 'en' 
          ? `Extreme price hike! A ${Math.round((ratio - 1) * 100)}% increase will severely reduce customer demand in this region.` 
          : `অত্যধিক মূল্যবৃদ্ধি! ${Math.round((ratio - 1) * 100)}% দাম বাড়ালে এই এলাকায় ক্রেতার চাহিদা ব্যাপকভাবে কমে যাবে।`,
        icon: AlertTriangle,
        color: 'text-rose-600 bg-rose-100',
        borderColor: 'border-rose-200'
      };
    }

    // 2. Extreme Price Drop Warning
    if (ratio < 0.4 && currentPrice > 0) {
      return {
        type: 'warning',
        desc: lang === 'en' 
          ? `Significant price drop detected. Ensure your profit margins are protected at $${currentPrice}.` 
          : `বিশাল মূল্যহ্রাস শনাক্ত হয়েছে। $${currentPrice} মূল্যে আপনার লাভ ঠিক আছে কি না যাচাই করুন।`,
        icon: AlertCircle,
        color: 'text-amber-600 bg-amber-100',
        borderColor: 'border-amber-200'
      };
    }

    // 3. High Demand / Low Stock logic (Reactive)
    if (p.demandLevel === 'High' && p.stock < 15) {
      if (ratio < 1.05) {
        return {
          type: 'increase',
          change: 1.1, // Suggesting +10%
          desc: lang === 'en' 
            ? `Demand is high and stock is low (${p.stock}). Increase price to $${Math.round(p.price * 1.1)} to maximize profit.` 
            : `পণ্যের চাহিদা বেশি এবং স্টক কম (${p.stock})। লাভ বাড়াতে দাম $${Math.round(p.price * 1.1)} এ উন্নীত করুন।`,
          icon: TrendingUp,
          color: 'text-emerald-600 bg-emerald-50',
          borderColor: 'border-emerald-100'
        };
      } else if (ratio >= 1.05 && ratio <= 1.2) {
        return {
          type: 'maintain',
          desc: lang === 'en' 
            ? `Price is currently optimized for high demand. Good job!` 
            : `উচ্চ চাহিদার জন্য এই মূল্যটি বর্তমানে সঠিক আছে। ভালো সিদ্ধান্ত!`,
          icon: ShieldCheck,
          color: 'text-indigo-600 bg-indigo-50',
          borderColor: 'border-indigo-100'
        };
      }
    }

    // 4. Low Demand / High Stock logic (Reactive)
    if (p.demandLevel === 'Low' && p.stock > 40) {
      if (ratio > 0.95) {
        return {
          type: 'decrease',
          change: 0.9, // Suggesting -10%
          desc: lang === 'en' 
            ? `Low demand and high stock (${p.stock}). Reduce price to $${Math.round(p.price * 0.9)} to clear inventory faster.` 
            : `চাহিদা কম এবং স্টক বেশি (${p.stock})। স্টক দ্রুত খালি করতে দাম $${Math.round(p.price * 0.9)} এ কমিয়ে দিন।`,
          icon: TrendingDown,
          color: 'text-amber-600 bg-amber-50',
          borderColor: 'border-amber-100'
        };
      } else {
        return {
          type: 'maintain',
          desc: lang === 'en' 
            ? `Promotional price is active. Monitoring for demand recovery.` 
            : `ছাড় মূল্য সক্রিয় আছে। চাহিদা বাড়ার ওপর নজর রাখা হচ্ছে।`,
          icon: ShieldCheck,
          color: 'text-indigo-600 bg-indigo-50',
          borderColor: 'border-indigo-100'
        };
      }
    }

    // Default: Optimal or Neutral
    return {
      type: 'maintain',
      desc: t.maintainPriceDesc,
      icon: Minus,
      color: 'text-slate-400 bg-slate-100',
      borderColor: 'border-slate-200'
    };
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handlePriceChange = (id: string, val: string) => {
    const numVal = parseFloat(val);
    if (!isNaN(numVal)) {
      setEditingPrices(prev => ({ ...prev, [id]: numVal }));
    } else if (val === '') {
      setEditingPrices(prev => ({ ...prev, [id]: 0 }));
    }
  };

  const applyRecommendation = (p: Product) => {
    const displayPrice = editingPrices[p.id] ?? p.price;
    const logic = getPricingLogic(p, displayPrice);
    if (logic.change) {
      const newPrice = Math.round(p.price * logic.change);
      onUpdatePrice(p.id, newPrice);
      setEditingPrices(prev => {
        const next = { ...prev };
        delete next[p.id];
        return next;
      });
      showToast(t.priceUpdated);
    }
  };

  const handleManualSave = (id: string) => {
    const newPrice = editingPrices[id];
    if (newPrice !== undefined) {
      onUpdatePrice(id, newPrice);
      setEditingPrices(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      showToast(t.priceUpdated);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500 relative">
      {toast && (
        <div className="fixed top-20 right-8 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-8 duration-300 border-l-4 bg-white text-emerald-700 border-l-emerald-500">
          <CheckCircle className="w-5 h-5" />
          <p className="font-black text-sm">{toast}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{t.pricingControl}</h3>
          <p className="text-slate-500 mt-1 font-medium">Execute AI-driven pricing strategies and operational controls.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100">
             <Sparkles className="w-4 h-4" />
             <span className="text-xs font-black uppercase tracking-widest">Pricing AI Active</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
           <div className="relative w-full md:w-80">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
              type="text" 
              placeholder="Filter by product name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
             />
           </div>
           <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <RefreshCcw className="w-3 h-3" />
              Auto-updating based on real-time price inputs
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">{t.addProductName}</th>
                <th className="px-8 py-5">Stock / {t.demand}</th>
                <th className="px-8 py-5">{t.aiRecommendation}</th>
                <th className="px-8 py-5">{t.currentPrice}</th>
                <th className="px-8 py-5 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map(p => {
                const displayPrice = editingPrices[p.id] ?? p.price;
                const logic = getPricingLogic(p, displayPrice);
                const RecIcon = logic.icon;
                const isEditing = editingPrices[p.id] !== undefined;

                return (
                  <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                          <Package className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm tracking-tight">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                           <span className={`text-xs font-black ${p.stock < 10 ? 'text-rose-500' : 'text-slate-700'}`}>{p.stock} Units</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full w-fit ${
                          p.demandLevel === 'High' ? 'bg-emerald-100 text-emerald-700' : 
                          p.demandLevel === 'Medium' ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {p.demandLevel === 'High' ? t.highDemand : p.demandLevel}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                      <div className={`p-4 rounded-2xl flex items-start gap-3 border shadow-sm transition-all duration-300 ${logic.borderColor} ${logic.color}`}>
                         <div className={`p-2 rounded-xl shrink-0 bg-white/50`}>
                           <RecIcon className="w-5 h-5" />
                         </div>
                         <p className="text-xs font-bold leading-relaxed">
                           {logic.desc}
                         </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col gap-1">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input 
                              type="number" 
                              value={displayPrice}
                              onChange={(e) => handlePriceChange(p.id, e.target.value)}
                              className={`w-24 pl-6 pr-3 py-2 border rounded-xl font-black text-sm outline-none transition-all ${
                                isEditing ? 'border-indigo-400 ring-2 ring-indigo-50 bg-white shadow-inner' : 'border-slate-200 bg-slate-50 shadow-sm'
                              }`}
                            />
                          </div>
                          {logic.change && (
                             <button 
                              onClick={() => applyRecommendation(p)}
                              className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline text-left mt-1"
                             >
                               {t.applyRecommendation} (${Math.round(p.price * (logic.change || 1))})
                             </button>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button 
                        onClick={() => handleManualSave(p.id)}
                        disabled={!isEditing}
                        className={`p-3 rounded-xl transition-all ${
                          isEditing 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-105' 
                            : 'text-slate-300 pointer-events-none'
                        }`}
                       >
                         <Save className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
