import React from 'react';
import { Incident, DemoUser } from '../types';

interface LiveSosViewProps {
  incident: Incident;
  currentUser: DemoUser;
  onVotePoll: (incidentId: string, option: 'NEEDS_HELP' | 'HELP_PROVIDED' | 'UNCLEAR') => void;
  onNavigateTab: (tab: string) => void;
  onResolveIncident?: (incidentId: string) => void;
}

export const LiveSosView: React.FC<LiveSosViewProps> = ({
  incident,
  currentUser,
  onVotePoll,
  onNavigateTab,
  onResolveIncident,
}) => {
  const userVote = incident.poll.userVotes[currentUser.id];
  const isFaculty = currentUser.role === 'Faculty / Responder';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-32 flex flex-col gap-8 text-left">
      {/* Top Incident Status Header */}
      <div className="bg-[#12141D] border-2 border-[#ef4444] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-[0_0_40px_rgba(239,68,68,0.25)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#ef4444] text-white flex items-center justify-center pulse-red shadow-[0_0_20px_rgba(239,68,68,0.6)]">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                emergency
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-[#ef4444] text-white px-3 py-0.5 rounded font-mono-code text-xs font-bold uppercase tracking-wider">
                  {incident.status}
                </span>
                <span className="font-mono-code text-xs text-[#adc6ff]">
                  ID: {incident.id}
                </span>
                <span className="font-mono-code text-xs text-[#8c909f]">
                  • {incident.timestamp}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#e1e3e4]">
                HELP REQUEST SENT
              </h1>
              <p className="font-sans text-sm text-[#c2c6d6] mt-1">
                {incident.type} at <span className="text-[#adc6ff] font-semibold">{incident.location}</span>
              </p>
            </div>
          </div>

          {/* Call 911 or Resolve */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {isFaculty && onResolveIncident && (
              <button
                onClick={() => onResolveIncident(incident.id)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono-code text-xs font-bold transition-colors cursor-pointer"
              >
                MARK RESOLVED
              </button>
            )}
            <a
              href="tel:911"
              className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-[#282a2b] border border-white/20 hover:bg-[#323536] text-[#ffb4ab] font-mono-code text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">call</span>
              CALL 911 DIRECTLY
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Status Timeline + Live Responders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Coordination Status Timeline */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="font-display text-lg font-bold text-[#e1e3e4] flex items-center gap-2 border-b border-white/10 pb-4">
            <span className="material-symbols-outlined text-[#4d8eff]">
              wifi_tethering
            </span>
            COORDINATION STATUS TIMELINE
          </h2>

          <div className="space-y-6 relative pl-6 border-l-2 border-[#4d8eff]/40 ml-3">
            {/* Step 1: Triggered */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#10b981] border-2 border-[#12141D]" />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-white">
                    1. One-Tap SOS Triggered
                  </h3>
                  <span className="font-mono-code text-[11px] text-[#10b981]">
                    COMPLETED ({incident.timestamp})
                  </span>
                </div>
                <p className="text-xs text-[#c2c6d6]">
                  Location verified: {incident.location}. Dispatched from student identity {incident.studentName} ({incident.studentId}).
                </p>
              </div>
            </div>

            {/* Step 2: Campus Alert */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#10b981] border-2 border-[#12141D]" />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-white">
                    2. Campus Security Alert Broadcasted
                  </h3>
                  <span className="font-mono-code text-[11px] text-[#10b981]">
                    ACTIVE BROADCAST
                  </span>
                </div>
                <p className="text-xs text-[#c2c6d6]">
                  Notification sent to on-duty security staff and registered campus responders.
                </p>
              </div>
            </div>

            {/* Step 3: AI Triage */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#4d8eff] border-2 border-[#12141D] animate-ping" />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-white">
                    3. AI Emergency Triage Assessment
                  </h3>
                  <span className="font-mono-code text-[11px] text-[#adc6ff]">
                    {incident.aiTriage ? 'ASSESSMENT READY' : 'ANALYZING...'}
                  </span>
                </div>
                {incident.aiTriage && (
                  <div className="bg-[#0c0f10] p-4 rounded-xl border border-white/10 text-xs space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#df7412]/20 text-[#ffb786] font-mono-code font-bold text-[10px]">
                        URGENCY: {incident.aiTriage.urgency}
                      </span>
                      <span className="text-[#8c909f] font-mono-code text-[10px]">
                        SEVERITY: {incident.aiTriage.severityScore}/10
                      </span>
                    </div>
                    <p className="text-[#e1e3e4] font-medium">
                      {incident.aiTriage.whatWeObserve}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Responders En Route */}
            <div className="relative">
              <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-[#12141D] ${incident.responders.length > 0 ? 'bg-emerald-500' : 'bg-gray-600'}`} />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-white">
                    4. Responders En Route / On Scene
                  </h3>
                  <span className="font-mono-code text-[11px] text-[#adc6ff]">
                    {incident.responders.length > 0 ? `${incident.responders.length} RESPONDING` : 'AWAITING FIELD UNITS'}
                  </span>
                </div>
                {incident.firstResponder ? (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    <span>First Responder On Scene: <strong>{incident.firstResponder}</strong></span>
                  </div>
                ) : (
                  <p className="text-xs text-[#8c909f]">
                    Waiting for first responder to accept assignment...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Responders Card & Live Poll */}
        <div className="space-y-6">
          {/* Active Responders Panel */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="font-display text-sm font-bold text-[#e1e3e4] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4d8eff]">
                shield_person
              </span>
              ACTIVE RESPONDERS ({incident.responders.length})
            </h3>

            {incident.responders.length > 0 ? (
              <div className="space-y-2">
                {incident.responders.map((name, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#1d2021] border border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold text-[#e1e3e4]">{name}</span>
                    </div>
                    {idx === 0 && (
                      <span className="text-[10px] font-mono-code bg-[#4d8eff]/20 text-[#adc6ff] px-2 py-0.5 rounded">
                        FIRST RESPONDER
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8c909f] italic">
                No responders assigned yet.
              </p>
            )}
          </div>

          {/* Shared Live Poll Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-4 border-t-2 border-[#ffb786]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-[#e1e3e4] uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ffb786]">
                  how_to_vote
                </span>
                SHARED LIVE POLL
              </h3>
              <span className="text-[10px] font-mono-code bg-[#ffb786]/20 text-[#ffb786] px-2 py-0.5 rounded">
                REAL-TIME
              </span>
            </div>
            <p className="text-xs text-[#c2c6d6]">
              What is the current situation on scene? (All users see real-time updates)
            </p>

            <div className="space-y-2">
              <button
                onClick={() => onVotePoll(incident.id, 'NEEDS_HELP')}
                className={`w-full p-3 rounded-xl border text-xs font-mono-code flex items-center justify-between transition-all cursor-pointer ${
                  userVote === 'NEEDS_HELP'
                    ? 'bg-[#ef4444]/20 border-[#ef4444] text-white font-bold'
                    : 'bg-[#1d2021] border-white/10 text-[#c2c6d6] hover:bg-[#282a2b]'
                }`}
              >
                <span>🚨 NEEDS IMMEDIATE HELP</span>
                <span className="bg-black/40 px-2 py-0.5 rounded text-[11px]">
                  {incident.poll.needsImmediateHelp} votes
                </span>
              </button>

              <button
                onClick={() => onVotePoll(incident.id, 'HELP_PROVIDED')}
                className={`w-full p-3 rounded-xl border text-xs font-mono-code flex items-center justify-between transition-all cursor-pointer ${
                  userVote === 'HELP_PROVIDED'
                    ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                    : 'bg-[#1d2021] border-white/10 text-[#c2c6d6] hover:bg-[#282a2b]'
                }`}
              >
                <span>✅ HELP IS BEING PROVIDED</span>
                <span className="bg-black/40 px-2 py-0.5 rounded text-[11px]">
                  {incident.poll.helpBeingProvided} votes
                </span>
              </button>

              <button
                onClick={() => onVotePoll(incident.id, 'UNCLEAR')}
                className={`w-full p-3 rounded-xl border text-xs font-mono-code flex items-center justify-between transition-all cursor-pointer ${
                  userVote === 'UNCLEAR'
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                    : 'bg-[#1d2021] border-white/10 text-[#c2c6d6] hover:bg-[#282a2b]'
                }`}
              >
                <span>❓ SITUATION UNCLEAR</span>
                <span className="bg-black/40 px-2 py-0.5 rounded text-[11px]">
                  {incident.poll.situationUnclear} votes
                </span>
              </button>
            </div>
          </div>

          {/* AI Guidance Shortcut */}
          <button
            onClick={() => onNavigateTab('ai-doctor')}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#1d2021] to-[#282a2b] border border-[#4d8eff]/30 hover:border-[#4d8eff] transition-all flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#4d8eff]" style={{ fontVariationSettings: "'FILL' 1" }}>
                smart_toy
              </span>
              <div>
                <div className="font-display text-xs font-bold text-white">
                  NEED FIRST AID INSTRUCTIONS?
                </div>
                <div className="text-[11px] text-[#c2c6d6]">
                  Open AI Health Guide for step-by-step guidance
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#adc6ff]">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
