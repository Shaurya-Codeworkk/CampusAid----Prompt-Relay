import React from 'react';

export const CampusHelp: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-32 flex flex-col gap-8 text-left">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4d8eff]/10 text-[#adc6ff] font-mono-code text-xs font-bold uppercase mb-2">
          CAMPUS MEDICAL SERVICES
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#e1e3e4]">
          CAMPUS MEDICAL & SAFETY HELP
        </h1>
        <p className="font-sans text-sm text-[#c2c6d6] mt-1">
          Direct contact information for on-campus medical response and 24/7 security dispatch.
        </p>
      </div>

      {/* Primary Emergency Hotline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Campus Medical Center */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border-l-4 border-[#4d8eff]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#4d8eff]/20 text-[#adc6ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_hospital
              </span>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#e1e3e4]">
                Campus Medical Center
              </h2>
              <span className="text-xs font-mono-code text-emerald-400">
                ● OPEN NOW (24/7 CARE)
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-[#c2c6d6]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#adc6ff] text-base">
                location_on
              </span>
              <span>Health Sciences Building, Room 102</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#adc6ff] text-base">
                schedule
              </span>
              <span>Operating Hours: 24/7 Urgent First Aid & Triage</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#adc6ff] text-base">
                call
              </span>
              <span className="font-mono-code font-bold text-white text-sm">(555) 019-2834</span>
            </div>
          </div>

          <a
            href="tel:5550192834"
            className="w-full py-3.5 bg-[#4d8eff] text-[#00285d] font-mono-code text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#adc6ff] transition-colors shadow-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">call</span>
            CALL MEDICAL CENTER
          </a>
        </div>

        {/* Card 2: Campus Security Dispatch */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border-l-4 border-[#ef4444]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#ef4444]/20 text-[#ffb4ab] flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield
              </span>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#e1e3e4]">
                Campus Security Command
              </h2>
              <span className="text-xs font-mono-code text-[#ffb4ab]">
                ● IMMEDIATE FIELD DISPATCH
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-[#c2c6d6]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ffb4ab] text-base">
                location_on
              </span>
              <span>Administration Building, West Gate</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ffb4ab] text-base">
                emergency
              </span>
              <span>24/7 Security Escorts & Rapid Response</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ffb4ab] text-base">
                call
              </span>
              <span className="font-mono-code font-bold text-white text-sm">(555) 911-0000</span>
            </div>
          </div>

          <a
            href="tel:5559110000"
            className="w-full py-3.5 bg-[#ef4444] text-white font-mono-code text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">shield</span>
            CALL SECURITY DISPATCH
          </a>
        </div>
      </div>

      {/* Additional Campus Resources */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="font-display text-lg font-bold text-[#e1e3e4]">
          CAMPUS HEALTH SERVICES & SPECIALTIES
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#0c0f10] p-4 rounded-xl border border-white/10 space-y-1">
            <div className="font-bold text-white">Mental Health Crisis Hotline</div>
            <div className="text-[#8c909f]">24/7 Confidential Student Support</div>
            <div className="font-mono-code font-bold text-[#adc6ff] pt-1">(555) 988-8423</div>
          </div>

          <div className="bg-[#0c0f10] p-4 rounded-xl border border-white/10 space-y-1">
            <div className="font-bold text-white">Late Night Safety Walk Escort</div>
            <div className="text-[#8c909f]">Available dusk till dawn campus-wide</div>
            <div className="font-mono-code font-bold text-[#adc6ff] pt-1">(555) 019-WALK</div>
          </div>

          <div className="bg-[#0c0f10] p-4 rounded-xl border border-white/10 space-y-1">
            <div className="font-bold text-white">Poison Control Center</div>
            <div className="text-[#8c909f]">Immediate toxic substance assistance</div>
            <div className="font-mono-code font-bold text-[#adc6ff] pt-1">(800) 222-1222</div>
          </div>
        </div>
      </div>
    </div>
  );
};
