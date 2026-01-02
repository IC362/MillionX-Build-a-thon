
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { InventoryControl } from './components/InventoryControl';
import { ManageProducts } from './components/ManageProducts';
import { AIInsights } from './components/AIInsights';
import { AlertCenter } from './components/AlertCenter';
import { Chatbot } from './components/Chatbot';
import { Language, Product, Transaction, Notification, TranslationSchema } from './types';
import { translations } from './i18n';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Smartwatch Pro', category: 'Electronics', price: 199, stock: 45, demandLevel: 'High', purchaseFrequency: 31 },
  { id: '2', name: 'Coffee Maker Elite', category: 'Home', price: 89, stock: 5, demandLevel: 'Medium', purchaseFrequency: 12 },
  { id: '3', name: 'Eco-Cotton T-Shirt', category: 'Apparel', price: 25, stock: 120, demandLevel: 'High', purchaseFrequency: 88 },
  { id: '4', name: 'Bluetooth Earbuds', category: 'Electronics', price: 59, stock: 12, demandLevel: 'Low', purchaseFrequency: 5 },
  { id: '5', name: 'Ceramic Vase Set', category: 'Home', price: 45, stock: 30, demandLevel: 'Medium', purchaseFrequency: 18 },
];

const generateMockTransactions = (products: Product[]): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();
  products.forEach(p => {
    const count = Math.floor(Math.random() * 15) + 5;
    for (let i = 0; i < count; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      transactions.push({
        id: Math.random().toString(36).substr(2, 9),
        productId: p.id,
        date: date.toISOString(),
        quantity: Math.floor(Math.random() * 3) + 1,
        price: p.price
      });
    }
  });
  return transactions;
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>(() => generateMockTransactions(INITIAL_PRODUCTS));
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [targetProductId, setTargetProductId] = useState<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    const newNotifications: Notification[] = [];
    products.forEach(p => {
      if (p.stock < 10) {
        newNotifications.push({
          id: `notif-stock-${p.id}`,
          type: 'low_stock',
          title: lang === 'en' ? 'Low Stock Warning' : 'স্টক কম সতর্কতা',
          message: lang === 'en' 
            ? `${p.name} only has ${p.stock} units left.` 
            : `${p.name} এর মাত্র ${p.stock} টি মজুদ আছে।`,
          timestamp: new Date().toISOString(),
          read: false,
          link: 'alerts',
          productId: p.id
        });
      }
    });
    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const filtered = newNotifications.filter(n => !existingIds.has(n.id));
      return [...filtered, ...prev].slice(0, 10);
    });
  }, [products, lang]);

  const addProduct = (p: Omit<Product, 'id' | 'demandLevel'>) => {
    const newProduct: Product = {
      ...p,
      id: Math.random().toString(36).substr(2, 9),
      demandLevel: 'Medium',
      purchaseFrequency: 0,
      isNew: true
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateProductPrice = (id: string, newPrice: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, price: newPrice } : p));
  };

  const handleNotificationClick = (notif: Notification) => {
    if (notif.productId) {
      setTargetProductId(notif.productId);
      setActiveTab('alerts');
    } else if (notif.link) {
      setActiveTab(notif.link);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard lang={lang} products={products} transactions={transactions} onNavToAlerts={() => setActiveTab('alerts')} />;
      case 'inventory':
        return (
          <InventoryControl 
            lang={lang} 
            products={products} 
            onAdd={addProduct} 
            onRemove={removeProduct} 
            onUpload={(items) => {
              items.forEach(item => addProduct({ name: item.name, category: item.category, price: item.price, stock: item.quantity }));
            }} 
          />
        );
      case 'manage':
        return <ManageProducts lang={lang} products={products} onUpdatePrice={updateProductPrice} />;
      case 'insights':
        return <AIInsights lang={lang} products={products} autoTargetId={targetProductId} onClearTarget={() => setTargetProductId(null)} />;
      case 'alerts':
        return <AlertCenter lang={lang} products={products} onAction={(id) => {
          setTargetProductId(id);
          setActiveTab('insights');
        }} />;
      default:
        return <Dashboard lang={lang} products={products} transactions={transactions} onNavToAlerts={() => setActiveTab('alerts')} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar 
        lang={lang} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <Header 
          lang={lang} 
          setLang={setLang} 
          title={t[activeTab as keyof TranslationSchema] as string || activeTab}
          notifications={notifications}
          markAllRead={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
          onNav={setActiveTab}
          onNotifClick={handleNotificationClick}
        />
        
        <div className="p-4 md:p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </main>

      <Chatbot lang={lang} products={products} />
    </div>
  );
};

export default App;
