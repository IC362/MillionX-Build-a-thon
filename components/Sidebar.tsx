
import React from 'react';
import { LayoutDashboard, Sparkles, Box, DollarSign, Bell, Zap } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n';

interface SidebarProps {
  lang: Language;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ lang, activeTab, setActiveTab }) => {
  const t = translations[lang];

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard },
    { id: 'inventory', icon: Box, label: t.productInventory },
    { id: 'manage', icon: DollarSign, label: t.manageProducts },
    { id: 'insights', icon: Sparkles, label: t.aiInsights },
    { id: 'alerts', icon: Bell, label: t.alertCenter },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
      <div className="p-6 flex items-center gap-2 border-b border-slate-100">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h1 className="font-bold text-xl text-indigo-900 leading-tight">TrackSmart BI</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 font-medium' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-indigo-900 rounded-full flex items-center justify-center text-white font-bold">
            LE
          </div>
          <div>
            <p className="font-semibold text-sm">Lavande Enterprise</p>
            <p className="text-xs text-slate-400">ENTERPRISE TIER</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
