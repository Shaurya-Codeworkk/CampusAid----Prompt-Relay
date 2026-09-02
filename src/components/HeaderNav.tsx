import React from 'react';
import { DemoUser } from '../types';
import { DEMO_USERS } from '../data/demoUsers';

interface HeaderNavProps {
  currentUser: DemoUser | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchUser: (user: DemoUser) => void;
  onOpenRoleSelector: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onSwitchUser,
  onOpenRoleSelector,
}) => {
  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-[#111415]/85 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 h-20 flex items-center justify-between">
      {/* Brand */}
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setActiveTab('home')}
      >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4d8eff] to-[#004395] flex items-center justify-center shadow-[0_0_15px_rgba(77,142,255,0.3)]">
          <span className="material-symbols-outlined text-white font-bold" style={{ fontSize: '24px' }}>
            shield
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-xl text-[#adc6ff] tracking-tight group-hover:text-white transition-colors">
            Assistive
          </span>
          <span className="text-[10px] font-mono-code text-[#8c909f] uppercase tracking-widest hidden sm:block">
            Campus Safety
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8 font-display text-sm font-medium">
        <button
          onClick={() => setActiveTab('home')}
          className={`pb-1 transition-all ${
            activeTab === 'home'
              ? 'text-[#adc6ff] font-bold border-b-2 border-[#adc6ff]'
              : 'text-[#c2c6d6] hover:text-[#adc6ff]'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab('ai-doctor')}
          className={`pb-1 transition-all ${
            activeTab === 'ai-doctor'
              ? 'text-[#adc6ff] font-bold border-b-2 border-[#adc6ff]'
              : 'text-[#c2c6d6] hover:text-[#adc6ff]'
          }`}
        >
          AI Guide
        </button>
        <button
          onClick={() => setActiveTab('emergency')}
          className={`pb-1 transition-all ${
            activeTab === 'emergency'
              ? 'text-[#adc6ff] font-bold border-b-2 border-[#adc6ff]'
              : 'text-[#c2c6d6] hover:text-[#adc6ff]'
          }`}
        >
          {currentUser?.role === 'Faculty / Responder' ? 'Command Center' : 'Emergency'}
        </button>
        <button
          onClick={() => setActiveTab('campus-help')}
          className={`pb-1 transition-all ${
            activeTab === 'campus-help'
              ? 'text-[#adc6ff] font-bold border-b-2 border-[#adc6ff]'
              : 'text-[#c2c6d6] hover:text-[#adc6ff]'
          }`}
        >
          Campus Help
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-1 transition-all flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'text-[#adc6ff] font-bold border-b-2 border-[#adc6ff]'
              : 'text-[#c2c6d6] hover:text-[#adc6ff]'
          }`}
        >
          <span className="material-symbols-outlined text-sm text-amber-400">workspace_premium</span>
          <span>Hero Credits</span>
        </button>
      </div>

      {/* User Switcher / Identity Badge */}
      <div className="flex items-center gap-3">
        {currentUser ? (
          <div className="flex items-center gap-2 bg-[#1d2021] border border-[#424754]/50 rounded-xl p-1 pr-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-lg object-cover border border-white/10"
            />
            <div className="flex flex-col text-left hidden sm:flex">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#e1e3e4] leading-tight">
                  {currentUser.name}
                </span>
                {currentUser.incidentsHelpedCount !== undefined && currentUser.incidentsHelpedCount > 0 && (
                  <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded text-[10px] font-mono-code font-bold">
                    🤝 {currentUser.incidentsHelpedCount} Helped
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono-code text-[#adc6ff] uppercase">
                {currentUser.heroBadgeTitle || currentUser.roleBadge} ({currentUser.heroCredits || 0} pts)
              </span>
            </div>

            {/* Quick Switch Dropdown / Button */}
            <div className="ml-2 pl-2 border-l border-white/10 flex items-center gap-1">
              <button
                onClick={onOpenRoleSelector}
                title="Switch Identity"
                className="p-1.5 rounded-lg bg-[#282a2b] hover:bg-[#323536] text-[#adc6ff] transition-colors flex items-center gap-1 text-xs font-mono-code"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  swap_horiz
                </span>
                <span className="hidden xl:inline">Switch</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenRoleSelector}
            className="flex items-center gap-2 bg-[#4d8eff] text-[#00285d] px-4 py-2 rounded-lg font-mono-code text-xs font-bold hover:bg-[#adc6ff] transition-colors shadow-md"
          >
            <span>Select Identity</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              login
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};
