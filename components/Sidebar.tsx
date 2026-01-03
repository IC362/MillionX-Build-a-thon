
import React from 'react';
import { LayoutDashboard, Sparkles, Box, DollarSign, Bell } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n';
import { LavenderLogo } from '../Logo';

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
    <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 ring-1 ring-indigo-500/20">
          <LavenderLogo size={24} className="text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="font-black text-lg text-slate-800 leading-none tracking-tight">TrackSmart BI</h1>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">by Lavande</span>
        </div>
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
                  ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-sm tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-black text-xs">
            LE
          </div>
          <div>
            <p className="font-black text-xs text-slate-800 tracking-tight uppercase">Lavande Enterprise</p>
            <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase">ENTERPRISE TIER</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
