
import React, { useState } from 'react';
import { Search, Bell, Clock, CheckCircle, Package, AlertCircle } from 'lucide-react';
import { Language, Notification } from '../types';
import { translations } from '../i18n';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  title: string;
  notifications: Notification[];
  markAllRead: () => void;
  onNav: (tab: string) => void;
  onNotifClick: (n: Notification) => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, setLang, title, notifications, markAllRead, onNav, onNotifClick }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const t = translations[lang];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
      <h2 className="text-xl font-black text-slate-800 tracking-tight">{title}</h2>

      <div className="flex items-center gap-6">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setLang('en')}
            className={`px-3 py-1 text-[10px] font-black rounded ${lang === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLang('bn')}
            className={`px-3 py-1 text-[10px] font-black rounded ${lang === 'bn' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            বাংলা
          </button>
        </div>

        <div className="relative hidden lg:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search dashboard..." 
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
          />
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className={`relative p-2.5 rounded-xl transition-all ${showNotifs ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white font-black shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifs(false)}></div>
              <div className="absolute right-0 mt-4 w-96 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h4 className="font-black text-slate-800 text-sm">{t.notifications}</h4>
                  <button onClick={markAllRead} className="text-[10px] text-indigo-600 font-black uppercase tracking-widest hover:underline">
                    {t.markAsRead}
                  </button>
                </div>
                <div className="max-h-[450px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-10" />
                      <p className="text-sm font-bold">{t.noNotifications}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-4 ${!n.read ? 'bg-indigo-50/30' : ''}`}
                          onClick={() => {
                            onNotifClick(n);
                            setShowNotifs(false);
                          }}
                        >
                          <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${n.type === 'low_stock' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                            {n.type === 'low_stock' ? <AlertCircle className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm text-slate-800 leading-tight">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">{n.message}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-3 font-black uppercase tracking-widest">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          {!n.read && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-2 ring-4 ring-indigo-50 shadow-lg shrink-0"></div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
