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
              <p className="text-xs text-[#c2c6d6] mt-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#adc6ff]">
                  person
                </span>
                Reported by {activeIncident.studentName} ({activeIncident.studentId}) • {activeIncident.responders.length} Responder(s) En Route
              </p>
            ) : (
              <p className="text-xs text-[#c2c6d6] mt-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#ffb786]">
                  info
                </span>
                Campus Safety dispatched • Status: {activeIncident.status} • {activeIncident.responders.length} Responder(s)
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => playEmergencyBeep()}
            title="Play Siren Alert Sound"
            className="px-3 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 font-mono-code text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm animate-bounce">
              volume_up
            </span>
            <span>BEEP SOUND</span>
          </button>

          <button
            onClick={() => onViewIncident(activeIncident)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-[#282a2b] border border-white/20 text-[#e1e3e4] hover:bg-[#323536] font-mono-code text-xs font-bold transition-colors"
          >
            VIEW INCIDENT
          </button>

          <button
            onClick={() => onRespond(activeIncident.id)}
            disabled={hasResponded}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-mono-code text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
              hasResponded
                ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 cursor-default'
                : 'bg-[#4d8eff] text-[#00285d] hover:bg-[#adc6ff] cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {hasResponded ? 'check_circle' : 'shield_person'}
            </span>
            {hasResponded ? 'YOU ARE RESPONDING' : "I'M RESPONDING"}
          </button>
        </div>
      </div>
    </div>
  );
};
