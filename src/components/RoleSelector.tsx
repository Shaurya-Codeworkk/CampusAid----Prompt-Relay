import React from 'react';
import { DemoUser } from '../types';
import { DEMO_USERS } from '../data/demoUsers';

interface RoleSelectorProps {
  onSelectUser: (user: DemoUser) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectUser }) => {
  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effect */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle at 50% -20%, rgba(77, 142, 255, 0.18) 0%, transparent 60%)',
        }}
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col gap-10 text-center">
        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1d2021] border border-white/10 text-[#adc6ff] font-mono-code text-xs font-semibold tracking-wider uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-[#4d8eff] animate-ping" />
            Evaluation Identity Portal
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#e1e3e4] tracking-tight">
            WHO ARE YOU?
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#c2c6d6] max-w-lg mx-auto">
            Select your role to configure your interface and permissions. One-click demo entry.
          </p>
        </header>

        {/* Identity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {DEMO_USERS.map((user) => {
            const isResponder = user.role === 'Faculty / Responder';
            return (
              <button
                key={user.id}
                onClick={() => onSelectUser(user)}
                className={`group relative flex flex-col p-6 rounded-2xl bg-[#1d2021] border border-white/10 ${
                  isResponder
                    ? 'hover:border-[#df7412]/60 hover:shadow-[0_0_30px_rgba(223,116,18,0.15)]'
                    : 'hover:border-[#4d8eff]/60 hover:shadow-[0_0_30px_rgba(77,142,255,0.15)]'
                } transition-all duration-300 hover:-translate-y-1 overflow-hidden text-left h-full cursor-pointer`}
              >
                {/* Accent top gradient line */}
                <div
                  className={`absolute top-0 left-0 w-full h-1 ${
                    isResponder
                      ? 'bg-gradient-to-r from-[#df7412] to-[#ffb786]'
                      : 'bg-gradient-to-r from-[#4d8eff] to-[#adc6ff]'
                  } opacity-0 group-hover:opacity-100 transition-opacity`}
                />

                {/* Top Avatar & Badge */}
                <div className="flex items-start justify-between w-full mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#282a2b] flex items-center justify-center overflow-hidden border border-white/10 shadow-md">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span
                    className={`font-mono-code text-xs px-3 py-1 rounded-full border ${
                      isResponder
                        ? 'bg-[#df7412]/20 text-[#ffb786] border-[#df7412]/40'
                        : 'bg-[#323536] text-[#c2c6d6] border-white/5'
                    }`}
                  >
                    {user.roleBadge}
                  </span>
                </div>

                {/* User Info */}
                <div className="flex-grow space-y-1">
                  <h2
                    className={`font-display text-2xl font-bold text-[#e1e3e4] ${
                      isResponder
                        ? 'group-hover:text-[#ffb786]'
                        : 'group-hover:text-[#adc6ff]'
                    } transition-colors`}
                  >
                    {user.name}
                  </h2>
                  <p className="font-mono-code text-xs text-[#8c909f]">
                    ID: {user.id}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between w-full">
                  <span className="font-mono-code text-xs text-[#c2c6d6] flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[16px] ${
                        isResponder ? 'text-[#ffb786]' : 'text-[#ffb4ab]'
                      }`}
                    >
                      {isResponder ? 'shield_person' : 'emergency'}
                    </span>
                    {user.actionText}
                  </span>
                  <span
                    className={`material-symbols-outlined text-[#8c909f] ${
                      isResponder
                        ? 'group-hover:text-[#ffb786]'
                        : 'group-hover:text-[#adc6ff]'
                    } transition-colors group-hover:translate-x-1 transition-transform`}
                  >
                    arrow_forward
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Evaluation Info Note */}
        <div className="text-xs font-mono-code text-[#8c909f] max-w-md mx-auto pt-4">
          Evaluation tip: Open 2 or 3 browser windows side-by-side (or tabs) with different identity roles to observe multi-user real-time emergency synchronization!
        </div>
      </div>
    </div>
  );
};
