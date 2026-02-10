
import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'ergo_scan', label: 'AI Ergo Scan', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2 17l.621-1.39A2 2 0 014.438 14.5h15.124a2 2 0 011.817 1.11L22 17M7 11V7a5 5 0 0110 0v4' },
    { id: 'meditation', label: 'Meditation', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { id: 'history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col p-6">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center text-white premium-shadow overflow-hidden p-2.5 transform hover:scale-110 transition-transform">
           <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
           </svg>
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600 tracking-tight">Relaxify</span>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as AppTab)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-teal-50 text-teal-600 shadow-sm' 
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            <svg 
              className={`w-5 h-5 ${activeTab === item.id ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
            </svg>
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto bg-gray-50 p-6 rounded-3xl border border-gray-100">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pro Tip</h4>
        <p className="text-xs text-gray-500 leading-relaxed">
          Try the **AI Ergo Scan** to optimize your physical environment.
        </p>
      </div>
    </aside>
  );
};
