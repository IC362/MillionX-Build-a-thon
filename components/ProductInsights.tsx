
import React from 'react';
import { Product, SaleRecord } from '../types';
import { translations, Language } from '../translations';

interface ProductInsightsProps {
  products: Product[];
  sales: SaleRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
  lang: Language;
}

const ProductInsights: React.FC<ProductInsightsProps> = ({ products, sales, selectedId, onSelect, lang }) => {
  const t = translations[lang];
  const selectedProduct = products.find(p => p.id === selectedId) || products[0];
  
  const purchaseCount = sales.filter(s => s.productId === selectedProduct.id).length;
  const isLowStock = selectedProduct.stock < 10;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-black">{t.productStats}</h3>
          <p className="text-sm text-slate-700 font-medium">Inventory & Sales performance</p>
        </div>
        <select 
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          className="bg-slate-50 border border-slate-300 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-black"
        >
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-3xl">
            {selectedProduct.category === 'Electronics' ? '📱' : selectedProduct.category === 'Home' ? '🏠' : '👕'}
          </div>
          <div>
            <h4 className="text-xl font-bold text-black">{selectedProduct.name}</h4>
            <p className="text-sm text-slate-800 font-medium">{selectedProduct.category} • {t.pricePerUnit}: ${selectedProduct.price}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs font-black text-black uppercase tracking-wider mb-1">{t.purchaseFrequency}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-indigo-700">{purchaseCount}</span>
              <span className="text-xs text-slate-900 font-bold">{t.timesPurchased}</span>
            </div>
          </div>
          <div className={`p-4 rounded-xl border ${isLowStock ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <p className={`text-xs font-black uppercase tracking-wider mb-1 ${isLowStock ? 'text-rose-700' : 'text-emerald-700'}`}>{t.stockLevel}</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${isLowStock ? 'text-rose-800' : 'text-emerald-800'}`}>{selectedProduct.stock}</span>
              <span className="text-xs text-slate-900 font-bold">{t.unitsLeft}</span>
            </div>
          </div>
        </div>

        {isLowStock ? (
          <div className="bg-rose-100 text-rose-900 px-4 py-3 rounded-xl flex items-center gap-3 animate-pulse border border-rose-200">
            <span className="text-xl">⚠️</span>
            <div className="text-xs">
              <p className="font-black">{t.lowStockWarning}</p>
              <p className="font-medium">Consider restocking soon to avoid lost sales.</p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-100 text-emerald-900 px-4 py-3 rounded-xl flex items-center gap-3 border border-emerald-200">
            <span className="text-xl">✅</span>
            <div className="text-xs">
              <p className="font-black">{t.inStock}</p>
              <p className="font-medium">Inventory levels are currently optimized.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInsights;
