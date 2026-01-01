
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import KPIStats from './components/KPIStats';
import TrendChart from './components/TrendChart';
import ProductInsights from './components/ProductInsights';
import { MOCK_SALES, MOCK_INTERACTIONS, INITIAL_ALERTS, MOCK_PRODUCTS } from './constants';
import { DashboardStats, AIAnalysisResult, Alert, Product } from './types';
import { getAIInsights, getActionPlan } from './services/geminiService';
import { translations, Language } from './translations';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lang, setLang] = useState<Language>('en');
  const [alerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState(MOCK_PRODUCTS[0]?.id || '');
  
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [activeActionPlan, setActiveActionPlan] = useState<{ index: number, text: string } | null>(null);

  // New Product Form State
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Electronics');
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [newProductStock, setNewProductStock] = useState(0);

  const t = translations[lang];

  const stats: DashboardStats = useMemo(() => {
    const totalRevenue = MOCK_SALES.reduce((acc, s) => acc + s.amount, 0);
    return {
      totalRevenue,
      totalOrders: MOCK_SALES.length,
      avgOrderValue: totalRevenue / MOCK_SALES.length,
      conversionRate: 3.2,
    };
  }, []);

  const handleRunAI = useCallback(async () => {
    setIsLoadingAI(true);
    try {
      const result = await getAIInsights(MOCK_SALES, MOCK_INTERACTIONS, lang);
      setAiResult(result);
    } catch (err) {
      console.error("AI Analysis failed", err);
    } finally {
      setIsLoadingAI(false);
    }
  }, [lang]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;
    
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name: newProductName,
      category: newProductCategory,
      price: newProductPrice,
      stock: newProductStock
    };
    
    setProducts(prev => [...prev, newProduct]);
    setNewProductName('');
    setNewProductPrice(0);
    setNewProductStock(0);
    if (!selectedProductId) setSelectedProductId(newProduct.id);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if (selectedProductId === id) {
      const remaining = products.filter(p => p.id !== id);
      setSelectedProductId(remaining.length > 0 ? remaining[0].id : '');
    }
  };

  const handleGetPlan = async (rec: string, index: number) => {
    if (activeActionPlan?.index === index) {
      setActiveActionPlan(null);
      return;
    }
    setIsLoadingAI(true);
    try {
      const plan = await getActionPlan(rec, lang);
      setActiveActionPlan({ index, text: plan });
    } catch (err) {
      console.error("Plan failed", err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    if (aiResult) handleRunAI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const displayAlerts = useMemo(() => {
    return alerts.map(alert => {
      if (lang === 'bn') {
        if (alert.id === '1') return { ...alert, title: t.alertRevenueSpikeTitle, description: t.alertRevenueSpikeDesc };
        if (alert.id === '2') return { ...alert, title: t.alertSentimentDropTitle, description: t.alertSentimentDropDesc };
      }
      return alert;
    });
  }, [alerts, lang, t]);

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} setLang={setLang}>
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{t.businessOverview}</h2>
              <p className="text-slate-500">{t.realTimeHealth}</p>
            </div>
            <button onClick={handleRunAI} disabled={isLoadingAI} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
              {isLoadingAI ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>{t.analyzing}</> : <><span role="img" aria-label="sparkles">✨</span> {t.getAiInsights}</>}
            </button>
          </div>
          
          <KPIStats stats={stats} lang={lang} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TrendChart data={MOCK_SALES} />
            </div>
            <div className="lg:col-span-1">
              <ProductInsights 
                products={products} 
                sales={MOCK_SALES} 
                selectedId={selectedProductId} 
                onSelect={setSelectedProductId} 
                lang={lang}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <h3 className="text-lg font-bold text-slate-800 mb-4">{t.customerSentiment}</h3>
              <div className="text-5xl mb-4" role="img" aria-label="happy face">😊</div>
              <h4 className="text-xl font-bold text-slate-900">{t.mostlyPositive}</h4>
              <p className="text-slate-500 mt-2 px-4 text-sm">{t.sentimentBasedOn}</p>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            {aiResult && (
               <div className="lg:col-span-2 bg-indigo-900 text-white p-8 rounded-3xl shadow-xl animate-in slide-in-from-bottom duration-700">
                <div className="flex items-center gap-3 mb-6"><span className="text-3xl" role="img" aria-label="robot">🤖</span><h3 className="text-xl font-bold">{t.aiReport}</h3></div>
                <p className="text-indigo-100 text-lg mb-4 leading-relaxed">{aiResult.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-indigo-300 uppercase tracking-wider text-xs mb-2">{t.anomaliesDetected}</h4>
                    <ul className="text-xs space-y-1 opacity-80">{aiResult.anomalies.slice(0, 3).map((a, i) => (<li key={i}>• {a}</li>))}</ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-300 uppercase tracking-wider text-xs mb-2">{t.recommendations}</h4>
                    <ul className="text-xs space-y-1 opacity-80">{aiResult.recommendations.slice(0, 3).map((r, i) => (<li key={i}>• {r}</li>))}</ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="max-w-4xl mx-auto py-12 text-center animate-in fade-in duration-500">
          {!aiResult ? (
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6" role="img" aria-label="sparkles">
                ✨
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t.noInsights}</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                {t.runAiDescription}
              </p>
              <button 
                onClick={handleRunAI}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
                disabled={isLoadingAI}
              >
                {isLoadingAI ? t.analyzing : t.getAiInsights}
              </button>
            </div>
          ) : (
            <div className="space-y-8 text-left">
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold mb-6">{t.salesForecast}</h3>
                <div className="h-64">
                   <TrendChart data={aiResult.forecast.map(f => ({ id: f.date, date: f.date, amount: f.predictedValue, category: 'Forecast', customerId: 'ai', productId: 'ai' }))} />
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold mb-4">{t.deepInsight}</h3>
                <p className="text-slate-600 leading-relaxed mb-6">{aiResult.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {aiResult.recommendations.map((rec, i) => (
                     <div key={i} className="group p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm text-slate-700">{rec}</p>
                          <button onClick={() => handleGetPlan(rec, i)} className="text-[10px] uppercase tracking-widest bg-indigo-200 hover:bg-indigo-300 px-2 py-1 rounded transition-colors shrink-0">
                            {activeActionPlan?.index === i ? 'Close' : t.getPlan}
                          </button>
                        </div>
                        {activeActionPlan?.index === i && (
                          <div className="mt-3 p-4 bg-white rounded-lg border border-indigo-100 text-xs text-slate-600 leading-relaxed shadow-inner animate-in slide-in-from-top duration-300 whitespace-pre-wrap">
                            {activeActionPlan.text}
                          </div>
                        )}
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-500">
          <div className="px-6 py-4 border-b border-slate-200 font-bold text-black">{t.productInventory}</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-black text-black uppercase tracking-wider">
                  <th className="px-6 py-4">{t.productName}</th>
                  <th className="px-6 py-4">{t.category}</th>
                  <th className="px-6 py-4">{t.price}</th>
                  <th className="px-6 py-4">{t.stock}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.length > 0 ? products.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-black">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-black font-medium">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-black">${product.price}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-md text-xs font-black ${product.stock < 10 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {product.stock} {t.unitsLeft}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-black font-medium italic">{t.noProducts}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-black mb-6">{t.addProduct}</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase">{t.productName}</label>
                <input required value={newProductName} onChange={e => setNewProductName(e.target.value)} type="text" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400" placeholder="e.g. Wireless Mouse" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase">{t.category}</label>
                <select value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="Electronics">Electronics</option>
                  <option value="Home">Home</option>
                  <option value="Apparel">Apparel</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase">{t.price} ($)</label>
                <input required value={newProductPrice} onChange={e => setNewProductPrice(Number(e.target.value))} type="number" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none" min="0" step="0.01" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase">{t.stock}</label>
                <input required value={newProductStock} onChange={e => setNewProductStock(Number(e.target.value))} type="number" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none" min="0" />
              </div>
              <button type="submit" className="lg:col-span-4 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                {t.addProduct}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 font-bold text-black">{t.manageProducts}</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-black text-black uppercase tracking-wider">
                    <th className="px-6 py-4">{t.productName}</th>
                    <th className="px-6 py-4">{t.category}</th>
                    <th className="px-6 py-4">{t.price}</th>
                    <th className="px-6 py-4">{t.stock}</th>
                    <th className="px-6 py-4 text-center">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-black">{product.name}</td>
                      <td className="px-6 py-4 font-medium text-black">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold">{product.category}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-black">${product.price}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-black ${product.stock < 10 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleRemoveProduct(product.id)} className="text-rose-700 hover:text-rose-900 font-black text-xs uppercase tracking-widest px-3 py-1 bg-rose-50 rounded-lg transition-colors border border-rose-100">
                          {t.removeProduct}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{t.alertCenter}</h2>
          {displayAlerts.map(alert => (
            <div key={alert.id} className={`p-5 rounded-2xl border flex gap-4 items-start transition-all hover:translate-x-1 ${alert.severity === 'high' ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'}`}>
              <div className={`p-3 rounded-full ${alert.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{alert.severity === 'high' ? '🚨' : '⚠️'}</div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1"><h4 className={`font-bold ${alert.severity === 'high' ? 'text-red-900' : 'text-slate-900'}`}>{alert.title}</h4><span className="text-xs text-slate-400">{new Date(alert.timestamp).toLocaleTimeString()}</span></div>
                <p className="text-sm text-slate-600">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default App;
