
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, AlertTriangle, Activity, Sparkles, ShoppingCart, DollarSign, ArrowRight, Calendar, Search, BarChart3, Filter } from 'lucide-react';
import { Language, Product, Transaction, TimeGranularity } from '../types';
import { translations } from '../i18n';

interface DashboardProps {
  lang: Language;
  products: Product[];
  transactions: Transaction[];
  onNavToAlerts: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang, products, transactions, onNavToAlerts }) => {
  const t = translations[lang];
  const [granularity, setGranularity] = useState<TimeGranularity>('daily');
  const [selectedProductId, setSelectedProductId] = useState<string>('');

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

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId);
  }, [products, selectedProductId]);

  const aggregatedChartData = useMemo(() => {
    if (!selectedProductId) return [];

    const now = new Date();
    const map: Record<string, { total: number, timestamp: number }> = {};
    
    // Filter transactions for the selected product
    let filteredTx = transactions.filter(tx => tx.productId === selectedProductId);
    
    // Apply time range based on granularity
    let cutoff = new Date();
    if (granularity === 'daily') cutoff.setDate(now.getDate() - 14); // Last 14 days
    else if (granularity === 'weekly') cutoff.setDate(now.getDate() - 84); // Last 12 weeks
    else if (granularity === 'monthly') cutoff.setDate(now.getDate() - 30); // Last 30 days (Month view)
    else if (granularity === 'yearly') cutoff.setFullYear(now.getFullYear() - 1); // Last 12 months

    filteredTx = filteredTx.filter(tx => new Date(tx.date) >= cutoff);

    filteredTx.forEach(tx => {
      const d = new Date(tx.date);
      let key = "";
      let sortKey = 0;

      if (granularity === 'daily') {
        // Daily: One data point per day
        key = d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric' });
        sortKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      } else if (granularity === 'weekly' || granularity === 'monthly') {
        // Weekly & Monthly: Group by calendar week
        const day = d.getDay();
        const diff = d.getDate() - day; // Start of week (Sunday)
        const startOfWeek = new Date(d.getFullYear(), d.getMonth(), diff);
        key = (lang === 'bn' ? 'সপ্তাহ: ' : 'Wk: ') + startOfWeek.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric' });
        sortKey = startOfWeek.getTime();
      } else if (granularity === 'yearly') {
        // Yearly: One data point per month
        key = d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', year: 'numeric' });
        sortKey = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      }

      if (!map[key]) {
        map[key] = { total: 0, timestamp: sortKey };
      }
      map[key].total += (tx.price * tx.quantity);
    });

    return Object.entries(map)
      .map(([date, data]) => ({ date, revenue: data.total, timestamp: data.timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [transactions, granularity, lang, selectedProductId]);

  const getAiTrendNote = () => {
    if (!selectedProductId) return lang === 'en' ? "Select a product to view its specific sales trend." : "বিক্রির প্রবণতা দেখতে একটি পণ্য নির্বাচন করুন।";
    if (aggregatedChartData.length < 2) return lang === 'en' ? "Aggregating historical data points..." : "ঐতিহাসিক তথ্য একত্রিত করা হচ্ছে...";
    
    const last = aggregatedChartData[aggregatedChartData.length - 1].revenue;
    const prev = aggregatedChartData[aggregatedChartData.length - 2].revenue;
    const diff = prev !== 0 ? ((last - prev) / prev) * 100 : 0;
    
    if (diff > 5) {
      return lang === 'en' 
        ? `Solid upward ${granularity} trend for ${selectedProduct?.name}.` 
        : `${selectedProduct?.name} এর জন্য ${t[granularity]} ঊর্ধ্বমুখী প্রবণতা লক্ষ্য করা যাচ্ছে।`;
    } else if (diff < -5) {
      return lang === 'en'
        ? `Downward ${granularity} trend detected. Check market demand.`
        : `${t[granularity]} নিম্নমুখী প্রবণতা শনাক্ত হয়েছে। বাজারের চাহিদা যাচাই করুন।`;
    }
    return lang === 'en' ? `Performance for ${selectedProduct?.name} is holding stable.` : `${selectedProduct?.name} এর কর্মক্ষমতা স্থিতিশীল আছে।`;
  };

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{t.businessOverview}</h3>
          <p className="text-slate-500 mt-1 font-medium">
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

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="w-full lg:w-auto space-y-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                 <BarChart3 className="w-5 h-5" />
                 <h4 className="font-black text-xl text-slate-800">
                   {selectedProduct ? `${t[granularity]} ${t.revenueTrend} - ${selectedProduct.name}` : t.productInsights}
                 </h4>
              </div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                {lang === 'en' ? 'Product-level incremental sales analysis' : 'পণ্য-ভিত্তিক বিস্তারিত বিক্রয় বিশ্লেষণ'}
              </p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500 appearance-none shadow-sm cursor-pointer hover:bg-white transition-colors"
              >
                <option value="">{lang === 'en' ? 'Select a product...' : 'একটি পণ্য নির্বাচন করুন...'}</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner w-full lg:w-auto overflow-x-auto no-scrollbar">
            {(['daily', 'weekly', 'monthly', 'yearly'] as TimeGranularity[]).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`px-6 py-2 text-[11px] font-black rounded-xl transition-all whitespace-nowrap ${
                  granularity === g 
                    ? 'bg-white shadow-md text-indigo-600 scale-105' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t[g]}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-indigo-50/50 p-4 rounded-2xl mb-8 flex items-center gap-3 border border-indigo-100/50">
           <div className="p-2 bg-white rounded-xl shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-500" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{t.aiRecommendation}</p>
              <p className="text-xs font-bold text-slate-700">{getAiTrendNote()}</p>
           </div>
        </div>

        <div className="h-[400px] w-full relative">
          {!selectedProductId ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/30 rounded-2xl border-2 border-dashed border-slate-100 animate-in fade-in duration-300">
              <Package className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-black text-lg max-w-sm">
                {t.selectProductToView}
              </p>
              <p className="text-xs mt-2 uppercase tracking-widest font-black opacity-60 italic">
                {lang === 'en' ? "Charts group data by day, week, or month based on your selection" : "আপনার পছন্দ অনুযায়ী গ্রাফটি দিন, সপ্তাহ বা মাস অনুযায়ী তথ্য দেখাবে"}
              </p>
            </div>
          ) : aggregatedChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aggregatedChartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8', fontWeight: '900'}} 
                  interval={granularity === 'daily' ? 1 : 0}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8', fontWeight: '900'}} 
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #f1f5f9', 
                    borderRadius: '16px', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }} 
                  labelStyle={{ fontWeight: '900', color: '#1e293b', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}
                  itemStyle={{ fontWeight: '800', color: '#6366f1' }}
                  formatter={(value) => [`$${value}`, t.revenueTrend]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                  animationDuration={800} 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/30 rounded-2xl border-2 border-dashed border-slate-100">
              <Activity className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold">{lang === 'en' ? 'No recent data points available for this product.' : 'এই পণ্যের জন্য সাম্প্রতিক কোনো তথ্য নেই।'}</p>
            </div>
          )}
        </div>
        
        {selectedProductId && (
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">
               {lang === 'en' 
                 ? `Displaying ${granularity} incremental growth for ${selectedProduct?.name}` 
                 : `${selectedProduct?.name} এর জন্য ${t[granularity]} প্রবৃদ্ধির তথ্য দেখানো হচ্ছে`}
             </p>
          </div>
        )}
      </div>
    </div>
  );
};
