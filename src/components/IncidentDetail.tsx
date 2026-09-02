import React from 'react';
import { Incident, DemoUser } from '../types';

interface IncidentDetailProps {
  incident: Incident;
  currentUser: DemoUser;
  onClose: () => void;
  onRespond: (incidentId: string) => void;
  onUpdateStatus: (incidentId: string, status: Incident['status']) => void;
  onVotePoll: (incidentId: string, option: 'NEEDS_HELP' | 'HELP_PROVIDED' | 'UNCLEAR') => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({
  incident,
  currentUser,
  onClose,
  onRespond,
  onUpdateStatus,
  onVotePoll,
}) => {
  const isFaculty = currentUser.role === 'Faculty / Responder';
  const isResponding = incident.responders.includes(currentUser.name);
  const triage = incident.aiTriage;
  const userVote = incident.poll.userVotes[currentUser.id];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#12141D] border border-white/20 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative text-left my-8 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8c909f] hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Top Title & Metadata */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-[#ef4444] text-white px-2.5 py-0.5 rounded font-mono-code text-xs font-bold uppercase">
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
              {incident.type}
            </h1>
            <p className="font-sans text-sm text-[#c2c6d6] mt-1">
              Location: <strong className="text-[#adc6ff]">{incident.location}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onRespond(incident.id)}
              disabled={isResponding}
              className={`px-4 py-2.5 rounded-xl font-mono-code text-xs font-bold transition-all shadow-md ${
                isResponding
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                  : 'bg-[#4d8eff] text-[#00285d] hover:bg-[#adc6ff] cursor-pointer'
              }`}
            >
              {isResponding ? 'YOU ARE RESPONDING' : "I'M RESPONDING"}
            </button>
          </div>
        </div>

        {/* Reporter Info & Photo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#0c0f10] p-4 rounded-xl border border-white/10 flex items-center gap-4">
            <img
              src={incident.studentAvatar}
              alt={incident.studentName}
              className="w-12 h-12 rounded-full object-cover border border-white/10"
            />
            <div>
              <div className="text-xs font-mono-code text-[#adc6ff] uppercase">REPORTED BY</div>
              <div className="font-bold text-[#e1e3e4]">{incident.studentName}</div>
              <div className="text-xs text-[#8c909f]">ID: {incident.studentId}</div>
            </div>
          </div>

          <div className="bg-[#0c0f10] p-4 rounded-xl border border-white/10 flex flex-col justify-center">
            <div className="text-xs font-mono-code text-[#adc6ff] uppercase mb-1">USER NOTE</div>
            <div className="text-xs text-[#c2c6d6] italic">
              {incident.note || 'No additional note provided.'}
            </div>
          </div>
        </div>

        {/* Attached Photo Preview if present */}
        {incident.hasImage && incident.imageUrl && (
          <div className="mb-8 bg-[#0c0f10] p-4 rounded-xl border border-white/10 space-y-2">
            <div className="text-xs font-mono-code text-[#adc6ff] uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">photo_camera</span>
              ATTACHED INCIDENT PHOTO
            </div>
            <img
              src={incident.imageUrl}
              alt="Incident attachment"
              className="max-h-64 rounded-lg object-contain border border-white/10"
            />
          </div>
        )}

        {/* AI Rapid Response Brief Section */}
        {triage ? (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border-l-4 border-[#4d8eff] mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#4d8eff] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  smart_toy
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-[#e1e3e4] uppercase tracking-wide">
                    AI RAPID EMERGENCY TRIAGE BRIEF
                  </h2>
                  <p className="text-xs text-[#8c909f]">
                    Automated clinical assessment • Confidence: {triage.confidence}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#ffb4ab] font-mono-code text-xs font-bold">
                  URGENCY: {triage.urgency}
                </span>
                <span className="px-3 py-1 rounded bg-[#282a2b] border border-white/10 text-white font-mono-code text-xs font-bold">
                  SEVERITY: {triage.severityScore}/10
                </span>
              </div>
            </div>

            {/* Observation Summary */}
            <div className="bg-[#0c0f10] p-4 rounded-xl border border-white/10 text-xs space-y-1">
              <div className="font-mono-code text-[#adc6ff] uppercase font-bold">OBSERVATION SUMMARY</div>
              <p className="text-[#e1e3e4] text-sm leading-relaxed">{triage.whatWeObserve}</p>
            </div>

            {/* Tactical Responder Brief */}
            <div className="bg-[#00285d]/40 border border-[#4d8eff]/30 p-4 rounded-xl text-xs space-y-1">
              <div className="font-mono-code text-[#adc6ff] uppercase font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">shield_person</span>
                TACTICAL RESPONDER BRIEF
              </div>
              <p className="text-white text-sm leading-relaxed">{triage.responderBrief}</p>
            </div>

            {/* Steps & Avoid Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Do Now */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl space-y-2">
                <div className="font-mono-code text-xs font-bold text-emerald-400 uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  IMMEDIATE STEPS (DO NOW)
                </div>
                <ul className="list-disc list-inside text-xs text-[#c2c6d6] space-y-1">
                  {triage.immediateSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              {/* Things to Avoid */}
              <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl space-y-2">
                <div className="font-mono-code text-xs font-bold text-rose-400 uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  THINGS TO AVOID (DON'T)
                </div>
                <ul className="list-disc list-inside text-xs text-[#c2c6d6] space-y-1">
                  {triage.thingsToAvoid.map((avoid, idx) => (
                    <li key={idx}>{avoid}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6 rounded-2xl mb-8 text-xs text-[#8c909f] italic">
            Generating AI Triage assessment...
          </div>
        )}

        {/* Responders & Status Controls for Faculty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Responders Box */}
          <div className="bg-[#0c0f10] p-4 rounded-xl border border-white/10 space-y-2">
            <div className="text-xs font-mono-code text-[#adc6ff] uppercase font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">shield_person</span>
              ASSIGNED RESPONDERS ({incident.responders.length})
            </div>
            {incident.firstResponder && (
              <div className="text-xs text-emerald-400 font-mono-code font-bold">
                FIRST RESPONDER: {incident.firstResponder}
              </div>
            )}
            <div className="text-xs text-[#e1e3e4]">
              {incident.responders.length > 0 ? incident.responders.join(', ') : 'No responders assigned yet.'}
            </div>
          </div>

          {/* Status Update Controls */}
          {isFaculty && (
            <div className="bg-[#0c0f10] p-4 rounded-xl border border-white/10 space-y-2">
              <div className="text-xs font-mono-code text-[#adc6ff] uppercase font-bold">
                RESPONDER STATUS CONTROL
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onUpdateStatus(incident.id, 'RESPONDING')}
                  className="px-3 py-2 bg-blue-600/30 hover:bg-blue-600 text-blue-200 border border-blue-500/40 rounded-lg text-xs font-mono-code font-bold cursor-pointer"
                >
                  SET RESPONDING
                </button>
                <button
                  onClick={() => onUpdateStatus(incident.id, 'HELP PROVIDED')}
                  className="px-3 py-2 bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/40 rounded-lg text-xs font-mono-code font-bold cursor-pointer"
                >
                  SET HELP PROVIDED
                </button>
                <button
                  onClick={() => onUpdateStatus(incident.id, 'RESOLVED')}
                  className="col-span-2 px-3 py-2 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 border border-emerald-500/40 rounded-lg text-xs font-mono-code font-bold cursor-pointer"
                >
                  MARK AS RESOLVED
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Poll Section */}
        <div className="bg-[#0c0f10] p-6 rounded-xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb786]">how_to_vote</span>
              SHARED LIVE SITUATION POLL
            </h3>
            <span className="text-[10px] font-mono-code text-[#adc6ff]">
              REAL-TIME SYNCHRONIZED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onVotePoll(incident.id, 'NEEDS_HELP')}
              className={`p-3 rounded-xl border text-xs font-mono-code flex items-center justify-between cursor-pointer ${
                userVote === 'NEEDS_HELP'
                  ? 'bg-[#ef4444]/20 border-[#ef4444] text-white font-bold'
                  : 'bg-[#1d2021] border-white/10 text-[#c2c6d6] hover:bg-[#282a2b]'
              }`}
            >
              <span>🚨 NEEDS HELP</span>
              <span className="bg-black/40 px-2 py-0.5 rounded">{incident.poll.needsImmediateHelp}</span>
            </button>

            <button
              onClick={() => onVotePoll(incident.id, 'HELP_PROVIDED')}
              className={`p-3 rounded-xl border text-xs font-mono-code flex items-center justify-between cursor-pointer ${
                userVote === 'HELP_PROVIDED'
                  ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                  : 'bg-[#1d2021] border-white/10 text-[#c2c6d6] hover:bg-[#282a2b]'
              }`}
            >
              <span>✅ HELP PROVIDED</span>
              <span className="bg-black/40 px-2 py-0.5 rounded">{incident.poll.helpBeingProvided}</span>
            </button>

            <button
              onClick={() => onVotePoll(incident.id, 'UNCLEAR')}
              className={`p-3 rounded-xl border text-xs font-mono-code flex items-center justify-between cursor-pointer ${
                userVote === 'UNCLEAR'
                  ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                  : 'bg-[#1d2021] border-white/10 text-[#c2c6d6] hover:bg-[#282a2b]'
              }`}
            >
              <span>❓ UNCLEAR</span>
              <span className="bg-black/40 px-2 py-0.5 rounded">{incident.poll.situationUnclear}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
