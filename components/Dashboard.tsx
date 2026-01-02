
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, AlertTriangle, Activity, Sparkles, ShoppingCart, DollarSign, ArrowRight } from 'lucide-react';
import { Language, Product, Transaction } from '../types';
import { translations } from '../i18n';

interface DashboardProps {
  lang: Language;
  products: Product[];
  transactions: Transaction[];
  onNavToAlerts: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang, products, transactions, onNavToAlerts }) => {
  const t = translations[lang];

  const globalStats = useMemo(() => {
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const atRisk = products.filter(p => p.stock < 10).length;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentOrders = transactions.filter(tx => new Date(tx.date) >= weekAgo).length;

    return {
      totalValue,
      totalProducts: products.length,
      atRisk,
      recentOrders
    };
  }, [products, transactions]);

  const aggregatedChartData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    transactions.forEach(tx => {
      const dateKey = new Date(tx.date).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
      dailyMap[dateKey] = (dailyMap[dateKey] || 0) + (tx.price * tx.quantity);
    });

    return Object.entries(dailyMap)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  const SummaryCard = ({ title, value, subText, icon: Icon, color, onClick }: any) => (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-indigo-200 group' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {onClick && <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-black mt-1">{value}</p>
        {subText && <p className="text-xs text-slate-400 mt-1">{subText}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-black text-slate-800">{t.businessOverview}</h3>
          <p className="text-slate-500 mt-1">
            {lang === 'en' ? 'Summary of business performance' : 'ব্যবসার সামগ্রিক অবস্থা'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-bold uppercase tracking-wider">Live Status</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title={t.totalStockValue} value={`$${globalStats.totalValue.toLocaleString()}`} icon={DollarSign} color="bg-indigo-600" />
        <SummaryCard title={t.totalProducts} value={globalStats.totalProducts} icon={Package} color="bg-blue-400" />
        <SummaryCard 
          title={t.atRiskItems} 
          value={globalStats.atRisk} 
          subText={globalStats.atRisk > 0 ? `${globalStats.atRisk} items need attention` : "All stock levels healthy"}
          icon={AlertTriangle} 
          color={globalStats.atRisk > 0 ? "bg-rose-500" : "bg-emerald-500"} 
          onClick={onNavToAlerts}
        />
        <SummaryCard title={t.recentSales} value={globalStats.recentOrders} subText="Last 7 days" icon={ShoppingCart} color="bg-amber-400" />
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h4 className="font-black text-xl text-slate-800">{t.salesTrend}</h4>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Total Shop Revenue Trend</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-lg">
               <TrendingUp className="w-4 h-4" />
               12%
             </div>
          </div>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={aggregatedChartData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
