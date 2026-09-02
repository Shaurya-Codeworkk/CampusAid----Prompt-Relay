import React from 'react';
import { Incident, DemoUser } from '../types';

interface ResponderDashboardProps {
  incidents: Incident[];
  currentUser: DemoUser;
  onViewIncident: (incident: Incident) => void;
  onRespond: (incidentId: string) => void;
  onUpdateStatus: (incidentId: string, status: Incident['status']) => void;
}

export const ResponderDashboard: React.FC<ResponderDashboardProps> = ({
  incidents,
  currentUser,
  onViewIncident,
  onRespond,
  onUpdateStatus,
}) => {
  const activeIncidents = incidents.filter((i) => i.status === 'ACTIVE' || i.status === 'RESPONDING');
  const totalResponders = Array.from(
    new Set(incidents.flatMap((i) => i.responders))
  ).length;
  const medicalRequests = incidents.filter((i) =>
    i.type.toLowerCase().includes('medical') || i.type.toLowerCase().includes('burn')
  ).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32 flex flex-col gap-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono-code text-xs text-[#adc6ff] uppercase tracking-wider font-bold">
              COMMAND CENTER ONLINE • FACULTY/RESPONDER ACCESS
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#e1e3e4]">
            CAMPUS RESPONSE CENTER
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1d2021] border border-white/10 px-4 py-2 rounded-xl text-xs font-mono-code">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-[#e1e3e4] font-bold">{currentUser.name}</span>
            <span className="text-[#ffb786]">({currentUser.id})</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Active Emergencies */}
        <div className="glass-panel rounded-2xl p-6 border-l-4 border-[#ef4444] space-y-2">
          <div className="flex items-center justify-between text-[#ffb4ab]">
            <span className="font-mono-code text-xs uppercase font-bold tracking-wider">
              ACTIVE EMERGENCIES
            </span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
          </div>
          <div className="font-display text-4xl font-extrabold text-white">
            {activeIncidents.length}
          </div>
          <p className="text-xs text-[#8c909f]">Requires field dispatch or monitoring</p>
        </div>

        {/* Responders on Scene */}
        <div className="glass-panel rounded-2xl p-6 border-l-4 border-[#4d8eff] space-y-2">
          <div className="flex items-center justify-between text-[#adc6ff]">
            <span className="font-mono-code text-xs uppercase font-bold tracking-wider">
              ON-SCENE RESPONDERS
            </span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield_person
            </span>
          </div>
          <div className="font-display text-4xl font-extrabold text-white">
            {totalResponders}
          </div>
          <p className="text-xs text-[#8c909f]">Faculty and security staff active</p>
        </div>

        {/* Medical Requests */}
        <div className="glass-panel rounded-2xl p-6 border-l-4 border-[#ffb786] space-y-2">
          <div className="flex items-center justify-between text-[#ffb786]">
            <span className="font-mono-code text-xs uppercase font-bold tracking-wider">
              MEDICAL ALERTS
            </span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_hospital
            </span>
          </div>
          <div className="font-display text-4xl font-extrabold text-white">
            {medicalRequests}
          </div>
          <p className="text-xs text-[#8c909f]">Assessed by AI emergency triage</p>
        </div>
      </div>

      {/* Live Emergency Feed Table */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-[#e1e3e4] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ef4444]">
                rss_feed
              </span>
              LIVE EMERGENCY INCIDENT FEED
            </h2>
            <p className="text-xs text-[#c2c6d6] mt-1">
              Real-time incident dispatch, AI triage status, and responder allocation.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-mono-code text-[#adc6ff] uppercase">
                <th className="py-3 px-4">INCIDENT ID</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">URGENCY</th>
                <th className="py-3 px-4">LOCATION</th>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">RESPONDERS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-sans">
              {incidents.map((incident) => {
                const isResponding = incident.responders.includes(currentUser.name);
                const isUrgent = incident.aiTriage?.urgency === 'URGENT' || incident.aiTriage?.urgency === 'HIGH';

                return (
                  <tr
                    key={incident.id}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => onViewIncident(incident)}
                  >
                    <td className="py-4 px-4 font-mono-code font-bold text-[#adc6ff]">
                      {incident.id}
                    </td>
                    <td className="py-4 px-4 font-bold text-[#e1e3e4]">
                      {incident.type}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded font-mono-code font-bold text-[10px] ${
                          isUrgent
                            ? 'bg-[#ef4444]/20 text-[#ffb4ab] border border-[#ef4444]/40'
                            : 'bg-[#df7412]/20 text-[#ffb786] border border-[#df7412]/40'
                        }`}
                      >
                        {incident.aiTriage?.urgency || 'MODERATE'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#c2c6d6]">
                      {incident.location}
                    </td>
                    <td className="py-4 px-4 font-mono-code text-[#8c909f]">
                      {incident.timestamp}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded font-mono-code text-[10px] uppercase font-bold ${
                          incident.status === 'ACTIVE'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : incident.status === 'RESPONDING'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {incident.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#c2c6d6]">
                      {incident.responders.length > 0 ? (
                        <span className="font-mono-code text-[11px] font-bold text-emerald-400">
                          {incident.responders.join(', ')}
                        </span>
                      ) : (
                        <span className="text-[#8c909f] italic">None</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onRespond(incident.id)}
                          disabled={isResponding}
                          className={`px-3 py-1.5 rounded-lg font-mono-code text-[11px] font-bold transition-all ${
                            isResponding
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-[#4d8eff] text-[#00285d] hover:bg-[#adc6ff] cursor-pointer'
                          }`}
                        >
                          {isResponding ? 'RESPONDING' : "I'M RESPONDING"}
                        </button>
                        <button
                          onClick={() => onViewIncident(incident)}
                          className="px-3 py-1.5 rounded-lg bg-[#282a2b] hover:bg-[#323536] text-[#e1e3e4] font-mono-code text-[11px] font-bold cursor-pointer"
                        >
                          BRIEF
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
