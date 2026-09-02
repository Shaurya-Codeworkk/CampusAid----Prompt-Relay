import React from 'react';
import { Incident, DemoUser } from '../types';
import { playEmergencyBeep } from '../utils/audio';

interface CampusAlertBannerProps {
  activeIncident: Incident;
  currentUser: DemoUser;
  onViewIncident: (incident: Incident) => void;
  onRespond: (incidentId: string) => void;
}

export const CampusAlertBanner: React.FC<CampusAlertBannerProps> = ({
  activeIncident,
  currentUser,
  onViewIncident,
  onRespond,
}) => {
  const isFaculty = currentUser.role === 'Faculty / Responder';
  const hasResponded = activeIncident.responders.includes(currentUser.name);

  return (
    <div className="w-full bg-[#12141D] border-y-2 border-[#ef4444] p-4 sm:p-6 relative overflow-hidden pulse-red shadow-[0_0_30px_rgba(239,68,68,0.25)] z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#ef4444]/20 border border-[#ef4444]/40 flex items-center justify-center flex-shrink-0 animate-pulse">
            <span className="material-symbols-outlined text-[#ffb4ab] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#ef4444] text-white px-2 py-0.5 rounded text-xs font-mono-code font-bold uppercase tracking-wider">
                ACTIVE CAMPUS ALERT
              </span>
              <span className="text-xs font-mono-code text-[#8c909f]">
                {activeIncident.timestamp}
              </span>
            </div>

            <h3 className="font-display text-lg sm:text-xl font-bold text-[#e1e3e4]">
              {activeIncident.type} at {activeIncident.location}
            </h3>

            {/* Privacy logic: Ordinary students see minimum info, Faculty sees authorized operational info */}
            {isFaculty ? (
              <p className="text-xs text-[#c2c6d6] mt-1 flex flex-wrap items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#adc6ff]">
                  person
                </span>
                <span>Reported by {activeIncident.studentName} ({activeIncident.studentId})</span>
                <span className="bg-[#4d8eff]/20 text-[#adc6ff] px-2 py-0.5 rounded font-mono-code text-[11px] font-bold">
                  🤝 {activeIncident.responders.length} Responder(s) / Helper(s) Active
                </span>
              </p>
            ) : (
              <p className="text-xs text-[#c2c6d6] mt-1 flex flex-wrap items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#ffb786]">
                  info
                </span>
                <span>Campus Safety dispatched • Status: {activeIncident.status}</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono-code text-[11px] font-bold border border-emerald-500/30">
                  🤝 {activeIncident.responders.length} Peer(s) Helping
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => playEmergencyBeep()}
            title="Play Siren Alert Beep Sound"
            className="px-3.5 py-2.5 rounded-xl bg-red-500/30 border border-red-500/60 text-red-200 hover:bg-red-500/50 font-mono-code text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse"
          >
            <span className="material-symbols-outlined text-sm text-red-400">
              volume_up
            </span>
            <span>SIREN BEEP</span>
          </button>

          <button
            onClick={() => onViewIncident(activeIncident)}
            className="px-4 py-2.5 rounded-xl bg-[#282a2b] border border-white/20 text-[#e1e3e4] hover:bg-[#323536] font-mono-code text-xs font-bold transition-colors"
          >
            VIEW DETAILS
          </button>

          <button
            onClick={() => onRespond(activeIncident.id)}
            disabled={hasResponded}
            className={`px-5 py-2.5 rounded-xl font-mono-code text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
              hasResponded
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-[#00281b] hover:brightness-110 cursor-pointer shadow-emerald-500/20'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {hasResponded ? 'check_circle' : 'handshake'}
            </span>
            {hasResponded ? 'YOU ARE HELPING (VOTED)' : "🤝 I AM HELPING NOW"}
          </button>
        </div>
      </div>
    </div>
  );
};
