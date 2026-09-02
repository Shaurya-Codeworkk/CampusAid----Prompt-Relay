import React, { useState, useEffect } from 'react';
import { DemoUser, Incident, EmergencyType, AccessibilityConfig } from './types';
import { DEMO_USERS } from './data/demoUsers';
import { HeaderNav } from './components/HeaderNav';
import { RoleSelector } from './components/RoleSelector';
import { CampusAlertBanner } from './components/CampusAlertBanner';
import { StudentHome } from './components/StudentHome';
import { SosModal } from './components/SosModal';
import { LiveSosView } from './components/LiveSosView';
import { ResponderDashboard } from './components/ResponderDashboard';
import { IncidentDetail } from './components/IncidentDetail';
import { AiHealthGuide } from './components/AiHealthGuide';
import { CampusHelp } from './components/CampusHelp';
import { IncidentHistory } from './components/IncidentHistory';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';
import { playEmergencyBeep } from './utils/audio';

export default function App() {

  // Initial launch opens Role Selection ("WHO ARE YOU?") screen
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [sosToast, setSosToast] = useState<{
    id: string;
    studentName: string;
    location: string;
    type: string;
  } | null>(null);

  // Accessibility State
  const [accessibility, setAccessibility] = useState<AccessibilityConfig>({
    language: 'English',
    simpleLanguage: false,
    largerText: false,
    highContrast: false,
  });

  // Fetch initial incidents and set up SSE / Polling sync
  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
      }
    } catch (err) {
      console.error('Error fetching incidents:', err);
    }
  };

  useEffect(() => {
    fetchIncidents();

    // SSE EventSource for real-time state synchronization
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/stream');

      eventSource.addEventListener('INITIAL_STATE', (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        if (data.incidents) setIncidents(data.incidents);
      });

      eventSource.addEventListener('INCIDENT_CREATED', (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        if (data.incident) {
          playEmergencyBeep();
          setIncidents((prev) => [data.incident, ...prev.filter((i) => i.id !== data.incident.id)]);
          setSosToast({
            id: data.incident.id,
            studentName: data.incident.studentName,
            location: data.incident.location,
            type: data.incident.type,
          });
        }
      });

      eventSource.addEventListener('INCIDENT_UPDATED', (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        if (data.incident) {
          setIncidents((prev) =>
            prev.map((i) => (i.id === data.incident.id ? data.incident : i))
          );
        }
      });
    } catch (err) {
      console.error('SSE initialization error:', err);
    }

    // Polling fallback every 2.5s
    const pollInterval = setInterval(() => {
      fetchIncidents();
    }, 2500);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
    };
  }, []);

  // Sync selectedIncident if updated in incidents array
  useEffect(() => {
    if (selectedIncident) {
      const updated = incidents.find((i) => i.id === selectedIncident.id);
      if (updated) setSelectedIncident(updated);
    }
  }, [incidents, selectedIncident]);

  // Active Emergency in system
  const activeIncident = incidents.find((i) => i.status === 'ACTIVE' || i.status === 'RESPONDING') || null;

  // Handlers
  const handleSelectUser = (user: DemoUser) => {
    setCurrentUser(user);
    setIsRoleSelectorOpen(false);
    if (user.role === 'Faculty / Responder') {
      setActiveTab('emergency');
    } else {
      setActiveTab('home');
    }
  };

  const handleOpenSosModal = () => {
    if (!currentUser) {
      setIsRoleSelectorOpen(true);
      return;
    }
    setIsSosModalOpen(true);
  };

  const handleSubmitSos = async (data: {
    type: EmergencyType;
    location: string;
    note: string;
    image?: string;
  }) => {
    if (!currentUser) return;

    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentAvatar: currentUser.avatar,
        type: data.type,
        location: data.location,
        note: data.note,
        image: data.image,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      playEmergencyBeep();
      setIncidents((prev) => [result.incident, ...prev]);
      setSosToast({
        id: result.incident.id,
        studentName: result.incident.studentName,
        location: result.incident.location,
        type: result.incident.type,
      });
      setActiveTab('emergency');
    }
  };

  const handleRespond = async (incidentId: string) => {
    if (!currentUser) return;

    const res = await fetch(`/api/incidents/${incidentId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responderName: currentUser.name }),
    });

    if (res.ok) {
      const result = await res.json();
      setIncidents((prev) =>
        prev.map((i) => (i.id === result.incident.id ? result.incident : i))
      );
    }
  };

  const handleVotePoll = async (
    incidentId: string,
    voteOption: 'NEEDS_HELP' | 'HELP_PROVIDED' | 'UNCLEAR'
  ) => {
    if (!currentUser) return;

    const res = await fetch(`/api/incidents/${incidentId}/poll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        voteOption,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      setIncidents((prev) =>
        prev.map((i) => (i.id === result.incident.id ? result.incident : i))
      );
    }
  };

  const handleUpdateStatus = async (incidentId: string, status: Incident['status']) => {
    const res = await fetch(`/api/incidents/${incidentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      const result = await res.json();
      setIncidents((prev) =>
        prev.map((i) => (i.id === result.incident.id ? result.incident : i))
      );
    }
  };

  const handleUpdateAccessibility = (config: Partial<AccessibilityConfig>) => {
    setAccessibility((prev) => ({ ...prev, ...config }));
  };

  if (isRoleSelectorOpen) {
    return <RoleSelector onSelectUser={handleSelectUser} />;
  }

  return (
    <div
      className={`min-h-screen bg-[#111415] text-[#e1e3e4] font-sans relative ${
        accessibility.largerText ? 'text-lg' : ''
      } ${accessibility.highContrast ? 'contrast-125' : ''}`}
    >
      {/* Navigation Bar */}
      <HeaderNav
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSwitchUser={(user) => handleSelectUser(user)}
        onOpenRoleSelector={() => setIsRoleSelectorOpen(true)}
      />

      {/* Campus Emergency Alert Banner if Active Incident exists and user is NOT the student who sent it */}
      {activeIncident && currentUser && (
        <div className="pt-20">
          <CampusAlertBanner
            activeIncident={activeIncident}
            currentUser={currentUser}
            onViewIncident={(inc) => setSelectedIncident(inc)}
            onRespond={handleRespond}
          />
        </div>
      )}

      {/* Main Tab Render */}
      <main className={activeIncident ? '' : 'pt-4'}>
        {activeTab === 'home' && currentUser && (
          <StudentHome
            currentUser={currentUser}
            activeIncident={activeIncident}
            onOpenSosModal={handleOpenSosModal}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'ai-doctor' && (
          <AiHealthGuide
            accessibility={accessibility}
            onUpdateAccessibility={handleUpdateAccessibility}
            onTriggerSos={handleOpenSosModal}
          />
        )}

        {activeTab === 'emergency' && (
          <>
            {currentUser?.role === 'Faculty / Responder' ? (
              <ResponderDashboard
                incidents={incidents}
                currentUser={currentUser}
                onViewIncident={(inc) => setSelectedIncident(inc)}
                onRespond={handleRespond}
                onUpdateStatus={handleUpdateStatus}
              />
            ) : activeIncident ? (
              <LiveSosView
                incident={activeIncident}
                currentUser={currentUser!}
                onVotePoll={handleVotePoll}
                onNavigateTab={setActiveTab}
                onResolveIncident={(id) => handleUpdateStatus(id, 'RESOLVED')}
              />
            ) : (
              <div className="max-w-4xl mx-auto px-4 pt-32 text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#12141D] border border-white/10 flex items-center justify-center text-[#adc6ff]">
                  <span className="material-symbols-outlined text-4xl">shield</span>
                </div>
                <h1 className="font-display text-3xl font-extrabold">NO ACTIVE EMERGENCIES</h1>
                <p className="text-sm text-[#c2c6d6] max-w-md mx-auto">
                  Campus is currently secure. You can trigger an emergency alert from the home screen if you need immediate assistance.
                </p>
                <button
                  onClick={handleOpenSosModal}
                  className="px-6 py-3 bg-[#ef4444] text-white font-mono-code text-xs font-bold rounded-xl shadow-lg hover:bg-red-600 transition-colors cursor-pointer"
                >
                  TRIGGER EMERGENCY SOS
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'campus-help' && <CampusHelp />}

        {activeTab === 'history' && (
          <IncidentHistory
            incidents={incidents}
            onViewIncident={(inc) => setSelectedIncident(inc)}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* SOS Modal Popup */}
      {currentUser && (
        <SosModal
          currentUser={currentUser}
          isOpen={isSosModalOpen}
          onClose={() => setIsSosModalOpen(false)}
          onSubmitSos={handleSubmitSos}
        />
      )}

      {/* Incident Detail Modal Popup */}
      {selectedIncident && currentUser && (
        <IncidentDetail
          incident={selectedIncident}
          currentUser={currentUser}
          onClose={() => setSelectedIncident(null)}
          onRespond={handleRespond}
          onUpdateStatus={handleUpdateStatus}
          onVotePoll={handleVotePoll}
        />
      )}

      {/* Floating Real-Time SOS Alert Push Toast (Judge Demo Highlight) */}
      {sosToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-bounce max-w-md w-full">
          <div className="glass-panel p-4 rounded-2xl bg-[#180808]/95 border-2 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)] flex items-start justify-between gap-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center flex-shrink-0 animate-ping">
                <span className="material-symbols-outlined text-red-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  emergency
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-red-500 text-white font-mono-code text-[10px] font-bold uppercase">
                    LIVE SOS ALERT DISPATCHED
                  </span>
                  <span className="text-[10px] font-mono-code text-red-300">Broadcasted</span>
                </div>
                <h4 className="font-display text-sm font-bold text-white">
                  {sosToast.type} at {sosToast.location}
                </h4>
                <p className="text-xs text-[#c2c6d6]">
                  Reported by <strong>{sosToast.studentName}</strong>. Alert sent to all Students & Responders!
                </p>
              </div>
            </div>

            <button
              onClick={() => setSosToast(null)}
              className="text-[#8c909f] hover:text-white text-xs font-mono-code p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Accessibility Controls */}
      <AccessibilityToolbar
        config={accessibility}
        onUpdate={handleUpdateAccessibility}
      />
    </div>
  );
}
