
import React, { useState } from 'react';
import { Upload, Plus, Trash2, Box, Loader2, Package, Search, FileDown, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Language, Product } from '../types';
import { translations } from '../i18n';
import { extractInvoiceData } from '../services/geminiService';

interface InventoryControlProps {
  lang: Language;
  products: Product[];
  onAdd: (p: any) => void;
  onRemove: (id: string) => void;
  onUpload: (data: { products: any[], transactions: any[] }) => void;
}

export const InventoryControl: React.FC<InventoryControlProps> = ({ lang, products, onAdd, onRemove, onUpload }) => {
  const t = translations[lang];
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'Electronics', price: 0, stock: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const items = await extractInvoiceData(base64);
        onUpload({
          products: items,
          transactions: items.map((item: any) => ({
            productId: item.name,
            date: new Date().toISOString(),
            quantity: item.quantity,
            price: item.price
          }))
        });
        showToast(lang === 'en' ? 'Invoice processed successfully!' : 'ইনভয়েস সফলভাবে প্রসেস করা হয়েছে!', 'success');
      } catch (err) {
        showToast(lang === 'en' ? 'Failed to process invoice' : 'ইনভয়েস প্রসেস করতে ব্যর্থ হয়েছে', 'error');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split('\n').filter(line => line.trim());
        if (lines.length < 2) throw new Error("Empty CSV");

        const header = lines[0].toLowerCase().split(',').map(h => h.trim());
        const expected = ["product_id", "product_name", "category", "date", "units_sold", "unit_price"];
        
        const isValid = expected.every(col => header.includes(col));
        if (!isValid) {
          showToast(t.csvInvalidHeader, 'error');
          return;
        }

        const productMap = new Map();
        const importedTransactions: any[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(cell => cell.trim());
          const data: any = {};
          header.forEach((h, idx) => data[h] = row[idx]);

          if (!data.product_id || !data.product_name) continue;

          productMap.set(data.product_id, {
            id: data.product_id,
            name: data.product_name,
            category: data.category,
            price: Number(data.unit_price),
            stock: 50
          });

          importedTransactions.push({
            productId: data.product_id,
            date: new Date(data.date).toISOString(),
            quantity: Number(data.units_sold),
            price: Number(data.unit_price)
          });
        }
        
        onUpload({
          products: Array.from(productMap.values()),
          transactions: importedTransactions
        });
        showToast(`${t.csvImportSuccess} (${importedTransactions.length} records)`, 'success');
      } catch (err) {
        showToast(t.csvParseError, 'error');
      }
    };
    reader.readAsText(file);
  };

  const downloadSampleCsv = () => {
    const headers = "product_id,product_name,category,date,units_sold,unit_price\n";
    const now = new Date();
    const rows = [
      `1,Smartwatch Pro,Electronics,${now.toISOString().split('T')[0]},12,199`,
      `2,Coffee Maker Elite,Home,${new Date(now.setDate(now.getDate()-1)).toISOString().split('T')[0]},4,89`,
      `NEW-01,Handcrafted Candle,Home,${new Date().toISOString().split('T')[0]},15,25`
    ].join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "tracksmart_sales_activity.csv";
    link.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onAdd(formData);
    setFormData({ name: '', category: 'Electronics', price: 0, stock: 0 });
    setShowAddForm(false);
    showToast(lang === 'en' ? 'Product added successfully' : 'পণ্য যোগ করা হয়েছে', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500 relative">
      {toast && (
        <div className={`fixed top-20 right-8 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-8 duration-300 border-l-4 ${toast.type === 'success' ? 'bg-white text-emerald-700 border-l-emerald-500' : 'bg-white text-rose-700 border-l-rose-500'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="font-black text-sm">{toast.message}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{t.productInventory}</h3>
          <p className="text-slate-500 mt-1 font-medium">Add products, upload sales CSV, or process invoices.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <button onClick={downloadSampleCsv} className="flex items-center gap-2 px-5 py-3 border border-slate-200 bg-white rounded-xl text-slate-600 font-black hover:bg-slate-50 transition-all text-xs uppercase tracking-widest">
            <FileDown className="w-4 h-4" />
            {t.sampleData}
          </button>
          
          <label className={`cursor-pointer flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 bg-white rounded-xl text-slate-700 font-black hover:bg-slate-50 transition-all text-xs uppercase tracking-widest ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            {t.importCsv}
            <input type="file" className="hidden" accept=".csv" onChange={handleCsvImport} />
          </label>

          <label className={`cursor-pointer flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 bg-white rounded-xl text-slate-700 font-black hover:bg-slate-50 transition-all text-xs uppercase tracking-widest ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-indigo-600" />}
            {loading ? t.processingInvoice : t.uploadInvoice}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
          
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 lg:flex-none bg-indigo-600 text-white px-6 py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all text-xs uppercase tracking-widest"
          >
            <Plus className="w-5 h-5" />
            {t.addNewProduct}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-indigo-600">
            <Box className="w-5 h-5" />
            {t.addNewProduct}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{t.addProductName}</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-slate-900" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{t.addCategory}</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-slate-900 appearance-none">
                <option>Electronics</option><option>Home</option><option>Apparel</option><option>Food</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{t.addPrice}</label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-slate-900" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{t.addStock}</label>
              <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-slate-900" required />
            </div>
            <div className="md:col-span-4 flex justify-end gap-3 pt-4 border-t border-slate-50">
               <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-3 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase text-xs tracking-widest">Cancel</button>
               <button type="submit" className="bg-indigo-600 text-white font-black px-10 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase text-xs tracking-widest">Add to Inventory</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
           <div className="relative w-full md:w-80">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
              type="text" 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
             />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                <th className="px-8 py-4">{t.addProductName}</th>
                <th className="px-8 py-4">{t.addCategory}</th>
                <th className="px-8 py-4">{t.addPrice}</th>
                <th className="px-8 py-4">{t.addStock}</th>
                <th className="px-8 py-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                        <Package className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <span className="font-black text-slate-800 text-sm tracking-tight block">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">ID: {p.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="bg-white border border-slate-200 text-slate-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">{p.category}</span>
                  </td>
                  <td className="px-8 py-4 font-black text-slate-700 text-sm">${p.price}</td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                       <span className={`font-black text-sm ${p.stock < 10 ? 'text-rose-500' : 'text-slate-700'}`}>{p.stock} Units</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button onClick={() => onRemove(p.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-white">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center">
                    <p className="text-slate-400 font-black italic">No items found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
