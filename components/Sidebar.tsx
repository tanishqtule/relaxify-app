
import React, { useState } from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  theme?: string;
  onThemeToggle?: () => void;
  themeIcon?: string;
}

const NAV_ITEMS: {
  id: AppTab;
  label: string;
  icon: React.ReactNode;
  emoji: string;
  description: string;
}[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    emoji: '⬡',
    description: 'Overview & programs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: 'ergo_scan',
    label: 'AI Ergo Scan',
    emoji: '◉',
    description: 'Workspace analysis',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="3" />
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      </svg>
    ),
  },
  {
    id: 'meditation',
    label: 'Meditation',
    emoji: '❋',
    description: 'Guided breathing',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'Analytics',
    emoji: '◈',
    description: 'Session history',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab, onTabChange, theme = 'system', onThemeToggle, themeIcon = '☀️',
}) => {
  const [hoveredItem, setHoveredItem] = useState<AppTab | null>(null);

  return (
    <aside
      className="w-72 flex flex-col sidebar-dark relative overflow-hidden"
      role="navigation"
      aria-label="Main navigation"
      style={{ flexShrink: 0 }}
    >
      {/* Ambient background glow inside sidebar */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 300, height: 300,
          top: '-10%', left: '-30%',
          background: 'radial-gradient(circle, rgba(56,249,215,0.07) 0%, transparent 70%)',
          filter: 'blur(30px)',
          animation: 'float 10s ease-in-out infinite',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 250, height: 250,
          bottom: '10%', right: '-20%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        aria-hidden="true"
      />

      {/* ── Logo ────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-7 py-8"
        style={{ borderBottom: '1px solid rgba(56,249,215,0.06)' }}
      >
        {/* Animated logo mark */}
        <div
          className="relative w-11 h-11 rounded-[14px] flex items-center justify-center premium-shadow"
          style={{
            background: 'linear-gradient(135deg, #38F9D7 0%, #20C997 100%)',
            boxShadow: '0 8px 24px rgba(56,249,215,0.35)',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6 text-[#071220]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" fillOpacity="0.25" />
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
          </svg>

          {/* Animated ring around logo */}
          <div
            className="absolute inset-[-3px] rounded-[16px] animate-border-flow"
            style={{ border: '1px solid rgba(56,249,215,0.4)' }}
            aria-hidden="true"
          />
        </div>

        <div>
          <span
            className="text-xl font-black tracking-tight text-gradient"
            aria-label="Relaxify"
          >
            Relaxify
          </span>
          <p
            className="text-[9px] font-bold uppercase tracking-[0.2em]"
            style={{ color: 'rgba(56,249,215,0.45)' }}
          >
            Wellness OS
          </p>
        </div>
      </div>

      {/* ── Nav section ─────────────────────────────────── */}
      <nav className="flex-1 px-4 py-6 space-y-1.5" aria-label="Application sections">
        <p
          className="text-[9px] font-black uppercase tracking-[0.25em] px-3 mb-4"
          style={{ color: 'rgba(56,249,215,0.3)' }}
        >
          Navigation
        </p>

        {NAV_ITEMS.map(item => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl nav-item ${
                isActive ? 'nav-item-active' : ''
              }`}
              style={{
                color: isActive
                  ? '#38F9D7'
                  : hoveredItem === item.id
                    ? 'rgba(220,240,236,0.85)'
                    : 'rgba(122,171,184,0.7)',
              }}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${item.label}: ${item.description}`}
            >
              {/* Icon */}
              <span
                style={{
                  color: isActive ? '#38F9D7' : 'inherit',
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(56,249,215,0.6))' : 'none',
                  transition: 'filter 0.3s ease',
                }}
                aria-hidden="true"
              >
                {item.icon}
              </span>

              {/* Labels */}
              <div className="flex-1 text-left">
                <p className="font-bold text-sm leading-tight">{item.label}</p>
                <p
                  className="text-[9px] font-medium leading-tight mt-0.5"
                  style={{ opacity: 0.55 }}
                >
                  {item.description}
                </p>
              </div>

              {/* Active dot */}
              {isActive && (
                <div
                  style={{
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: '#38F9D7',
                    boxShadow: '0 0 8px rgba(56,249,215,0.8)',
                    animation: 'glow-pulse 2s ease-in-out infinite',
                  }}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Wellness pulse indicator ─────────────────────── */}
      <div
        className="mx-4 p-5 rounded-2xl mb-4"
        style={{
          background: 'rgba(56,249,215,0.04)',
          border: '1px solid rgba(56,249,215,0.08)',
        }}
        role="status"
        aria-label="System wellness status"
      >
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-[9px] font-black uppercase tracking-[0.2em]"
            style={{ color: 'rgba(56,249,215,0.5)' }}
          >
            System Status
          </p>
          <div className="flex items-center gap-1.5">
            <div
              className="animate-pulse"
              style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: '#38F9D7',
                boxShadow: '0 0 8px rgba(56,249,215,0.8)',
              }}
              aria-hidden="true"
            />
            <span
              className="text-[9px] font-black uppercase tracking-widest"
              style={{ color: '#38F9D7' }}
            >
              Active
            </span>
          </div>
        </div>

        {/* Simulated vitals line */}
        <svg
          viewBox="0 0 180 30"
          className="w-full"
          style={{ height: 28 }}
          aria-hidden="true"
        >
          <path
            d="M0 15 L20 15 L30 5 L40 25 L50 12 L60 15 L80 15 L90 3 L100 27 L110 15 L130 15 L140 8 L150 22 L160 15 L180 15"
            fill="none"
            stroke="rgba(56,249,215,0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M0 15 L20 15 L30 5 L40 25 L50 12 L60 15 L80 15 L90 3 L100 27 L110 15 L130 15 L140 8 L150 22 L160 15 L180 15"
            fill="none"
            stroke="rgba(56,249,215,0.15)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <p
          className="text-[9px] font-medium mt-2 leading-relaxed"
          style={{ color: 'rgba(122,171,184,0.6)' }}
        >
          Try the <strong style={{ color: 'rgba(56,249,215,0.7)' }}>AI Ergo Scan</strong> to optimize your workspace.
        </p>
      </div>

      {/* ── Theme toggle ─────────────────────────────────── */}
      {onThemeToggle && (
        <div
          className="mx-4 mb-6"
          style={{ borderTop: '1px solid rgba(56,249,215,0.06)', paddingTop: 16 }}
        >
          <button
            onClick={onThemeToggle}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl nav-item"
            style={{ color: 'rgba(122,171,184,0.7)' }}
            aria-label={`Toggle theme. Current: ${theme}`}
          >
            <span className="text-base">{themeIcon}</span>
            <div className="text-left">
              <p className="font-bold text-sm leading-tight capitalize">{theme} Theme</p>
              <p className="text-[9px] font-medium opacity-55">Click to cycle</p>
            </div>
          </button>
        </div>
      )}
    </aside>
  );
};
