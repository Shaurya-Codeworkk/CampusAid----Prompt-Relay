import React, { useState } from 'react';
import { Incident, DemoUser } from '../types';
import { DEMO_USERS } from '../data/demoUsers';

interface IncidentHistoryProps {
  incidents: Incident[];
  onViewIncident: (incident: Incident) => void;
  currentUser?: DemoUser | null;
}

interface HeroMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  credits: number;
  badgeTitle: string;
  badgeLevel: 'LEGEND' | 'GOLD' | 'SILVER' | 'BRONZE' | 'ROOKIE';
  incidentsHelped: number;
  badgeColor: string;
  badgeIcon: string;
}

export const IncidentHistory: React.FC<IncidentHistoryProps> = ({
  incidents,
  onViewIncident,
  currentUser,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [endorsedIncidents, setEndorsedIncidents] = useState<Record<string, number>>({});
  const [showCreditInfo, setShowCreditInfo] = useState<boolean>(false);

  // Initial Hero Roster
  const [heroMembers, setHeroMembers] = useState<HeroMember[]>([
    {
      id: 'FAC-001',
      name: 'Dr. Mehta',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvF9f_kOXidy7T4ZJ9CO5QazFG0p1eb3h6bHQkc8fvuEqrwdWVlK6I0TJz1qaOGjbFH_PZXKIvsJtVh8R3Z2EewMHV_lAUJT1Dp9OOzyTkwZxf6QuJH1wLf_GyUudHToZv5XrJcG4CD4ntD8s-nh0TOBuh1KYqq-0U7YwXjeMVs-3vGoFTvGIeB1n15AogLfWNZP4L3jfX0kGKeB0xNDaYL3tqo0dcfkhaiLs_eGKk65dTeuFqAXoI',
      role: 'Faculty Responder',
      credits: 1250,
      badgeTitle: 'Cyber Sentinel Legend',
      badgeLevel: 'LEGEND',
      incidentsHelped: 12,
      badgeColor: 'from-cyan-400 via-blue-500 to-indigo-600',
      badgeIcon: 'diamond',
    },
    {
      id: 'OFF-001',
      name: 'Officer Singh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Campus Security Lead',
      credits: 920,
      badgeTitle: 'Gold Guardian Sentinel',
      badgeLevel: 'GOLD',
      incidentsHelped: 9,
      badgeColor: 'from-amber-300 via-yellow-500 to-amber-600',
      badgeIcon: 'military_tech',
    },
    {
      id: 'STU-002',
      name: 'Riya Verma',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjNdfpIs-UL--bSmOcibhSQA28HtrBr_aBb4WtcU-mJa-u5p9VoRVbwg523_a3qY8dConhE-MPImYXZ6GkwWoF3LOBIezAerYuTcwZdQkNwnJgAYKBht3BYSM5g9WbyOhFbNuYVI7SV_P34USzp-rffVVSdqdDcDM0_WMWzRKmW-NHW-TTp79lWW_noCh7a76lPmJnp7Plee7rJa5SyCmAUO6q7vkj-7a4cehAq4WiTA9198TcJ1YV',
      role: 'Student Volunteer',
      credits: 680,
      badgeTitle: 'Gold Guard Hero',
      badgeLevel: 'GOLD',
      incidentsHelped: 6,
      badgeColor: 'from-amber-400 to-yellow-600',
      badgeIcon: 'workspace_premium',
    },
    {
      id: 'STU-001',
      name: 'Aarav Sharma',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMxSZdh2EaZvHRzYrwuiGZLZeJmICYFUF7hOa9Skn7dyCYFVNOKVtJwnTKC3p5FnuQBd38Yl-iaWMpTxD5lRDEHhY7GMlBmPsyvMs2euxSpTAMzFWYNZXLF6L3Ypf8J_LDNhThYhphmalKhVv0gkinoM5a_jgdF4EQuR-GgrHljp90TjV9f4VQL1PIQJh_AabWwV_PlTN6Ezzl6AtR3Lm3Mv-BuKGbnp5OXFdjOGc4thoUmy-4E7mf',
      role: 'Student Safety Rep',
      credits: 450,
      badgeTitle: 'Silver Shield Guardian',
      badgeLevel: 'SILVER',
      incidentsHelped: 4,
      badgeColor: 'from-[#adc6ff] via-slate-300 to-slate-500',
      badgeIcon: 'shield_moon',
    },
  ]);

  // Handle Endorsing a Hero for an Incident (+10 Credits)
  const handleEndorseHero = (incidentId: string, responderName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEndorsedIncidents((prev) => ({
      ...prev,
      [incidentId]: (prev[incidentId] || 0) + 10,
    }));

    setHeroMembers((prev) =>
      prev.map((m) =>
        m.name.toLowerCase().includes(responderName.toLowerCase()) || responderName.toLowerCase().includes(m.name.toLowerCase())
          ? { ...m, credits: m.credits + 10 }
          : m
      )
    );
  };

  const filtered = incidents.filter((i) => {
    if (selectedMemberId) {
      const selectedMember = heroMembers.find((m) => m.id === selectedMemberId);
      if (selectedMember) {
        const matchesReporter = i.studentName.toLowerCase().includes(selectedMember.name.toLowerCase());
        const matchesResponder = i.responders.some((r) => r.toLowerCase().includes(selectedMember.name.toLowerCase()));
        if (!matchesReporter && !matchesResponder) return false;
      }
    }

    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'MY_CREDITS' && currentUser) {
      return i.studentName === currentUser.name || i.responders.includes(currentUser.name);
    }
    return i.status === filterStatus;
  });

  const loggedInHero = heroMembers.find((m) => m.id === currentUser?.id || m.name === currentUser?.name) || {
    name: currentUser?.name || 'Aarav Sharma',
    credits: currentUser?.heroCredits || 450,
    badgeTitle: currentUser?.heroBadgeTitle || 'Silver Shield Guardian',
    incidentsHelped: currentUser?.incidentsHelpedCount || 4,
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-32 flex flex-col gap-10 text-left">
      {/* SECTION HEADER */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-gradient-to-r from-[#0d1222] via-[#090d18] to-[#0d1222] p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-mono-code text-xs font-bold uppercase">
            <span className="material-symbols-outlined text-sm text-amber-400 animate-spin">
              workspace_premium
            </span>
            <span>AI GUARD HERO CREDIT SYSTEM</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#e1e3e4] tracking-tight">
            CAMPUS GUARDIAN HERO CREDITS & ARCHIVE
          </h1>
          <p className="font-sans text-sm text-[#c2c6d6] leading-relaxed">
            Recognizing campus community members who protect lives. Earn <strong>Hero Credit Points</strong> for swift emergency response, situation verification, and safety reports.
          </p>
        </div>

        {/* Action Button: How Credits Work */}
        <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full lg:w-auto">
          <button
            onClick={() => setShowCreditInfo(!showCreditInfo)}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono-code text-xs font-bold flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">help</span>
            <span>HOW CREDITS WORK</span>
          </button>
        </div>
      </div>

      {/* HOW HERO CREDITS WORK EXPANDABLE GUIDE */}
      {showCreditInfo && (
        <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 bg-[#090d19] space-y-4 animate-fadeIn text-left">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-display font-bold text-lg text-cyan-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400">workspace_premium</span>
              <span>Hero Credit Point Rewards & Tiers</span>
            </h3>
            <button
              onClick={() => setShowCreditInfo(false)}
              className="text-xs font-mono-code text-[#8c909f] hover:text-white"
            >
              Close ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono-code">
            <div className="p-3.5 rounded-2xl bg-[#12182b] border border-cyan-500/20 space-y-1">
              <span className="text-amber-400 text-lg">🏆 +250 PTS</span>
              <div className="font-bold text-white">First Responder on Scene</div>
              <p className="text-[11px] text-[#8c909f]">Arriving first to assist in an active SOS emergency alert.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#12182b] border border-cyan-500/20 space-y-1">
              <span className="text-cyan-400 text-lg">🛡️ +150 PTS</span>
              <div className="font-bold text-white">Field Incident Responder</div>
              <p className="text-[11px] text-[#8c909f]">Responding to campus safety dispatch or providing first aid.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#12182b] border border-cyan-500/20 space-y-1">
              <span className="text-emerald-400 text-lg">🚀 +100 PTS</span>
              <div className="font-bold text-white">Emergency Reporter</div>
              <p className="text-[11px] text-[#8c909f]">Alerting campus safety to hazards, fires, or medical needs.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#12182b] border border-cyan-500/20 space-y-1">
              <span className="text-purple-400 text-lg">🗳️ +50 PTS</span>
              <div className="font-bold text-white">Situation Verifier</div>
              <p className="text-[11px] text-[#8c909f]">Voting on live situation polls to help AI triage calculate urgency.</p>
            </div>
          </div>
        </div>
      )}

      {/* TOP HERO LEADERBOARD ROSTER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-xl">military_tech</span>
            <h2 className="font-display text-xl font-bold text-[#e1e3e4]">
              TOP CAMPUS HEROES & CREDITS
            </h2>
          </div>
          {selectedMemberId && (
            <button
              onClick={() => setSelectedMemberId(null)}
              className="text-xs font-mono-code text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Showing filtered logs</span>
              <span>(Clear Filter ✕)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {heroMembers.map((member, index) => {
            const isSelected = selectedMemberId === member.id;
            const rankMedal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

            return (
              <div
                key={member.id}
                onClick={() => setSelectedMemberId(isSelected ? null : member.id)}
                className={`glass-panel rounded-2xl p-5 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-4 group hover:scale-[1.02] ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_25px_rgba(56,189,248,0.3)]'
                    : 'border-white/10 hover:border-cyan-500/40 bg-[#0d1120]'
                }`}
              >
                {/* Metallic Rank Glow Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-cyan-400/50 shadow-md"
                      />
                      <span className="absolute -bottom-1 -right-1 text-xs bg-[#070913] px-1 rounded border border-white/20">
                        {rankMedal}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <h4 className="font-display text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {member.name}
                      </h4>
                      <span className="text-[10px] font-mono-code text-[#8c909f]">
                        {member.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hero Credit Pill & Badge */}
                <div className="space-y-2 border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono-code text-[#adc6ff] flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-amber-400 text-sm">
                        {member.badgeIcon}
                      </span>
                      <span>{member.badgeTitle}</span>
                    </span>
                    <span className="font-mono-code font-extrabold text-amber-400 text-sm">
                      {member.credits} PTS
                    </span>
                  </div>

                  {/* Level Progress Bar */}
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${member.badgeColor}`}
                      style={{ width: `${Math.min(100, (member.credits / 1500) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono-code text-[#8c909f]">
                    <span>{member.incidentsHelped} Emergencies Helped</span>
                    <span className="text-cyan-400 font-bold group-hover:underline">
                      {isSelected ? 'Selected' : 'View History'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER CONTROLS & TIMELINE */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-cyan-400">history</span>
          <h3 className="font-display text-xl font-bold text-[#e1e3e4]">
            INCIDENT AUDIT LOG & CREDIT LEDGER
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-[#0c101d] p-1.5 rounded-2xl border border-white/10 font-mono-code text-xs">
          {[
            { id: 'ALL', label: 'ALL INCIDENTS' },
            { id: 'MY_CREDITS', label: 'MY CREDITS' },
            { id: 'ACTIVE', label: 'ACTIVE' },
            { id: 'RESPONDING', label: 'RESPONDING' },
            { id: 'RESOLVED', label: 'RESOLVED' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === st.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold shadow-md'
                  : 'text-[#8c909f] hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* INCIDENT CARDS TIMELINE */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
            <span className="material-symbols-outlined text-4xl text-[#8c909f]">search_off</span>
            <p className="font-mono-code text-sm text-[#c2c6d6]">
              No incident logs found matching the selected filter.
            </p>
          </div>
        ) : (
          filtered.map((incident) => {
            const isUrgent =
              incident.aiTriage?.urgency === 'URGENT' || incident.aiTriage?.urgency === 'HIGH';
            const extraEndorse = endorsedIncidents[incident.id] || 0;
            const baseCredits = isUrgent ? 250 : 150;
            const totalAwardedCredits = baseCredits + extraEndorse;

            return (
              <div
                key={incident.id}
                onClick={() => onViewIncident(incident)}
                className="glass-panel rounded-2xl p-6 hover:border-cyan-400/50 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group bg-[#0d1120]/90 relative"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      incident.status === 'ACTIVE'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : incident.status === 'RESPONDING'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {incident.type.includes('Medical') || incident.type.includes('Burn')
                        ? 'local_hospital'
                        : incident.type.includes('Fire')
                        ? 'local_fire_department'
                        : 'warning'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono-code text-xs font-bold text-[#adc6ff]">
                        {incident.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono-code text-[10px] font-bold uppercase ${
                          isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {incident.aiTriage?.urgency || 'MODERATE'}
                      </span>
                      <span className="text-[#8c909f] text-xs font-mono-code">
                        • {incident.timestamp}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-[#e1e3e4] group-hover:text-cyan-300 transition-colors">
                      {incident.type}
                    </h3>

                    <p className="text-xs text-[#c2c6d6]">
                      📍 Location: <strong>{incident.location}</strong> • Reported by <strong>{incident.studentName}</strong>
                    </p>

                    {/* Responders & Hero Points Awarded Chip */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {incident.responders.map((resp, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[11px] font-mono-code font-bold flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs text-amber-400">workspace_premium</span>
                          <span>Responder: {resp}</span>
                        </span>
                      ))}

                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono-code font-bold flex items-center gap-1">
                        <span>✨ +{totalAwardedCredits} Hero Credits Awarded</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Status & Endorse Button */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 border-t md:border-0 pt-3 md:pt-0 border-white/10">
                  <span
                    className={`inline-block px-3 py-1 rounded-xl font-mono-code text-xs font-bold uppercase ${
                      incident.status === 'ACTIVE'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : incident.status === 'RESPONDING'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {incident.status}
                  </span>

                  {/* Endorse Hero Button */}
                  {incident.responders.length > 0 && (
                    <button
                      onClick={(e) => handleEndorseHero(incident.id, incident.responders[0], e)}
                      title="Applaud and endorse responder with +10 Hero Credits"
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 hover:bg-amber-500/30 text-amber-300 text-xs font-mono-code font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
                    >
                      <span>👏 Endorse (+10 PTS)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
