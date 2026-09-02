import React, { useState } from 'react';
import { DemoUser, Incident } from '../types';

interface StudentHomeProps {
  currentUser: DemoUser;
  activeIncident: Incident | null;
  onOpenSosModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  currentUser,
  activeIncident,
  onOpenSosModal,
  onNavigateTab,
}) => {
  const [quickInput, setQuickInput] = useState('');

  const handleQuickQuestion = (question: string) => {
    onNavigateTab('ai-doctor');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32 flex flex-col items-center gap-12">
      {/* User Header Profile Card */}
      <header className="w-full max-w-4xl bg-[#12141D] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-14 h-14 rounded-full border border-[#4d8eff]/30 object-cover shadow-md"
          />
          <div>
            <h1 className="font-display text-2xl font-bold text-[#e1e3e4]">
              {currentUser.name}
            </h1>
            <p className="font-mono-code text-xs text-[#c2c6d6]">
              {currentUser.id} • Role: {currentUser.role.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Campus Status Badge */}
        <div className="bg-[#0c0f10] border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-3 w-full sm:w-auto">
          {activeIncident ? (
            <>
              <span className="w-3 h-3 rounded-full bg-[#ef4444] animate-ping" />
              <span className="text-sm font-semibold text-[#ffb4ab]">
                Active Emergency: {activeIncident.type}
              </span>
            </>
          ) : (
            <>
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-sm font-semibold text-[#e1e3e4]">
                Campus is currently secure.
              </span>
            </>
          )}
        </div>
      </header>

      {/* ONE-TAP SOS Primary Action Section */}
      <section className="flex flex-col items-center justify-center my-4 relative">
        {/* Glow backdrop */}
        <div className="absolute w-72 h-72 rounded-full bg-[#ef4444]/20 blur-3xl pointer-events-none" />

        <button
          onClick={onOpenSosModal}
          className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-[#ef4444] sos-glow flex flex-col items-center justify-center gap-2 border-4 border-red-500/50 active:scale-95 hover:scale-105 transition-all duration-200 cursor-pointer shadow-[0_0_50px_rgba(239,68,68,0.6)]"
        >
          <span className="material-symbols-outlined text-white text-6xl sm:text-7xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            emergency
          </span>
          <span className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-widest">
            SOS
          </span>
          <span className="font-mono-code text-xs text-white/90 uppercase tracking-widest mt-1 bg-black/20 px-3 py-1 rounded-full">
            ONE-TAP TRIGGER
          </span>
        </button>

        <p className="font-sans text-sm text-[#c2c6d6] mt-6 text-center max-w-sm">
          For serious or immediate emergencies. Triggers campus-wide alert and AI triage.
        </p>
      </section>

      {/* Secondary Quick Action Bento Cards */}
      <section className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Campus Medical Help */}
        <div className="bg-[#12141D] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-lg hover:border-[#4d8eff]/40 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4d8eff]/20 flex items-center justify-center text-[#adc6ff]">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_hospital
              </span>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#e1e3e4]">
                Campus Medical Help
              </h3>
              <p className="text-xs text-[#c2c6d6]">Center info & 24/7 hotline</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('campus-help')}
            className="w-full bg-[#4d8eff] text-[#00285d] font-mono-code text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#adc6ff] transition-colors shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">call</span>
            CALL NOW
          </button>
        </div>

        {/* AI Access */}
        <div className="bg-[#12141D] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-lg hover:border-[#ffb786]/40 transition-colors relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#df7412]/20 flex items-center justify-center text-[#ffb786]">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                smart_toy
              </span>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#e1e3e4]">
                AI Health Guide
              </h3>
              <p className="text-xs text-[#c2c6d6]">Step-by-step first aid guidance</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('ai-doctor')}
            className="w-full border border-white/20 hover:bg-white/5 text-[#e1e3e4] font-mono-code text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">chat</span>
            ASK AI HEALTH GUIDE
          </button>
        </div>
      </section>

      {/* Hero Interactive AI Panel from Stitch Image 1 */}
      <section className="w-full max-w-5xl mt-8 space-y-8 text-center">
        <div className="space-y-4">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#e1e3e4] tracking-tight">
            WHEN SOMETHING GOES WRONG, KNOW WHAT TO DO.
          </h2>
          <p className="font-sans text-base text-[#c2c6d6] max-w-2xl mx-auto">
            Show us what happened, get clear guidance, and reach campus help faster.
          </p>
        </div>

        {/* AI Assistant Panel (Bento Style) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Left Col: Assistant Info */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col justify-between border-l-4 border-[#4d8eff]">
            <div>
              <div className="flex items-center gap-3 mb-4 text-[#adc6ff]">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  smart_toy
                </span>
                <h3 className="font-display text-lg font-bold uppercase tracking-wide">
                  MEET YOUR AI HEALTH GUIDE
                </h3>
              </div>
              <p className="font-sans text-sm text-[#c2c6d6] leading-relaxed">
                Calm, focused, and immediate. Describe your situation or upload a photo to get step-by-step guidance before help arrives.
              </p>
            </div>
            <div className="mt-8 bg-[#0c0f10] p-4 rounded-xl border border-white/10 flex gap-3 items-start">
              <span className="material-symbols-outlined text-[#8c909f] mt-0.5 text-lg">
                info
              </span>
              <p className="font-mono-code text-xs text-[#8c909f] leading-relaxed">
                AI guidance is for immediate assistance and does not replace professional medical care.
              </p>
            </div>
          </div>

          {/* Right Col: Interactive Prompt Area */}
          <div className="md:col-span-2 glass-panel rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4 mb-6">
              <div className="self-start bg-[#1d2021] p-4 rounded-2xl rounded-tl-sm max-w-[85%] border border-white/5">
                <p className="text-sm text-[#e1e3e4]">
                  I'm here to help. What's the situation?
                </p>
              </div>
            </div>

            {/* Suggested Prompt Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => handleQuickQuestion('What should I do for a minor burn?')}
                className="text-left bg-[#191c1d] hover:bg-[#282a2b] p-4 rounded-xl border border-white/5 transition-colors flex items-center gap-3 group cursor-pointer"
              >
                <div className="bg-[#4d8eff]/20 p-2 rounded-lg text-[#adc6ff] group-hover:bg-[#4d8eff] group-hover:text-[#00285d] transition-colors">
                  <span className="material-symbols-outlined text-lg">local_fire_department</span>
                </div>
                <span className="font-mono-code text-xs text-[#c2c6d6] group-hover:text-white">
                  What should I do for a minor burn?
                </span>
              </button>

              <button
                onClick={() => handleQuickQuestion('My friend fell. What should I check first?')}
                className="text-left bg-[#191c1d] hover:bg-[#282a2b] p-4 rounded-xl border border-white/5 transition-colors flex items-center gap-3 group cursor-pointer"
              >
                <div className="bg-[#df7412]/20 p-2 rounded-lg text-[#ffb786] group-hover:bg-[#df7412] group-hover:text-[#502400] transition-colors">
                  <span className="material-symbols-outlined text-lg">personal_injury</span>
                </div>
                <span className="font-mono-code text-xs text-[#c2c6d6] group-hover:text-white">
                  My friend fell. What should I check first?
                </span>
              </button>
            </div>

            {/* Input Redirect */}
            <div className="relative">
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onNavigateTab('ai-doctor');
                }}
                placeholder="Type your situation here..."
                className="w-full bg-[#0c0f10] border border-white/10 rounded-xl py-4 pl-4 pr-12 text-sm text-[#e1e3e4] placeholder-[#8c909f] focus:outline-none focus:ring-2 focus:ring-[#4d8eff]"
              />
              <button
                onClick={() => onNavigateTab('ai-doctor')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#4d8eff] text-[#00285d] rounded-lg hover:bg-[#adc6ff] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
