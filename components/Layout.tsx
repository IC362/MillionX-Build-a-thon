
import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';
import { GoogleGenAI } from "@google/genai";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, lang, setLang }) => {
  const t = translations[lang];
  const [lavenderImageUrl, setLavenderImageUrl] = useState<string | null>(null);

  // Generate the Lavender Brand Icon on mount using Gemini
  useEffect(() => {
    const generateLavenderIcon = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                text: 'A professional, elegant, minimalist circular icon of a single lavender flower sprig, soft purple background, clean aesthetic, high quality, digital art style.',
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1"
            }
          }
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            setLavenderImageUrl(`data:image/png;base64,${base64EncodeString}`);
            break;
          }
        }
      } catch (error) {
        console.error("Failed to generate brand icon:", error);
      }
    };

    generateLavenderIcon();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: '📊' },
    { id: 'analytics', label: t.aiInsights, icon: '✨' },
    { id: 'inventory', label: t.productInventory, icon: '📦' },
    { id: 'manage', label: t.manageProducts, icon: '⚙️' },
    { id: 'alerts', label: t.alertCenter, icon: '🔔' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 relative">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <span className="text-2xl">⚡</span> TrackSmart BI
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-200">
              LE
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">{t.enterpriseName}</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{t.planType}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-500" aria-label="Open Menu">☰</button>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              {menuItems.find(i => i.id === activeTab)?.label || activeTab}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            {/* Language Switcher */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${lang === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLang('bn')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${lang === 'bn' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                বাংলা
              </button>
            </div>

            <div className="relative hidden lg:block">
              <input 
                type="text" 
                placeholder="Search analytics..." 
                className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 w-64 outline-none transition-all text-black font-bold"
              />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
              🔔
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 relative">
          {children}

          {/* Lavender Brand Icon - Fixed Bottom Right */}
          <div className="fixed bottom-8 right-8 z-50">
            {lavenderImageUrl ? (
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-2xl overflow-hidden hover:scale-110 transition-transform duration-300 group cursor-pointer ring-4 ring-indigo-50">
                <img 
                  src={lavenderImageUrl} 
                  alt="Lavande Enterprise Signature" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-50 border-4 border-white shadow-xl flex items-center justify-center animate-pulse">
                <span className="text-3xl">🪻</span>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Layout;
