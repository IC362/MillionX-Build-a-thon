
import React from 'react';
import { DashboardStats } from '../types';
import { translations, Language } from '../translations';

interface KPIStatsProps {
  stats: DashboardStats;
  lang: Language;
}

const KPIStats: React.FC<KPIStatsProps> = ({ stats, lang }) => {
  const t = translations[lang];
  
  const cards = [
    { label: t.totalRevenue, value: `$${stats.totalRevenue.toLocaleString()}`, change: '+12.5%', icon: '💰', color: 'bg-emerald-50 text-emerald-600' },
    { label: t.orderVolume, value: stats.totalOrders.toString(), change: '+8.2%', icon: '📦', color: 'bg-indigo-50 text-indigo-600' },
    { label: t.avgOrderValue, value: `$${stats.avgOrderValue.toFixed(2)}`, change: '-2.1%', icon: '📈', color: 'bg-amber-50 text-amber-600' },
    { label: t.conversionRate, value: `${stats.conversionRate.toFixed(1)}%`, change: '+0.5%', icon: '🎯', color: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${card.color}`}>
              <span className="text-xl">{card.icon}</span>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${card.change.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {card.change}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h3>
        </div>
      ))}
    </div>
  );
};

export default KPIStats;
