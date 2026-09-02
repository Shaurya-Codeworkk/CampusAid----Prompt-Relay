import React, { useState, useRef, useEffect } from 'react';

interface AiDoctorMascotProps {
  status?: 'IDLE' | 'THINKING' | 'ANALYZING' | 'SPEAKING' | 'ALERT';
  message?: string;
  onQuickAction?: (actionPrompt: string) => void;
  onToggleCameraLive?: () => void;
  isCameraActive?: boolean;
  compactMode?: boolean;
}

export const AiDoctorMascot: React.FC<AiDoctorMascotProps> = ({
  status = 'IDLE',
  message = "Hello! I'm Dr. Meddy 🩺, your AI Doctor! I can analyze pain, bleeding, and guide you live step-by-step.",
  onQuickAction,
  onToggleCameraLive,
  isCameraActive = false,
  compactMode = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [mascotQuote, setMascotQuote] = useState<string | null>(null);
  const [sparkles, setSparkles] = useState<Array<{ id: number; emoji: string; x: number; y: number }>>([]);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse Tracking Handler for 3D Cursor Tilt & Eye Movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
    const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

    setMouseOffset({ x: normX, y: normY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMouseOffset({ x: 0, y: 0 });
  };

  const handleMascotClick = (e: React.MouseEvent) => {
    // Trigger Waving & Bouncing 3D Animation
    setIsWaving(true);
    setIsBouncing(true);

    setTimeout(() => setIsWaving(false), 2500);
    setTimeout(() => setIsBouncing(false), 850);

    // Spawn floating sparkles
    const newSparkles = [
      { id: Date.now() + 1, emoji: '✨', x: e.nativeEvent.offsetX - 20, y: e.nativeEvent.offsetY - 30 },
      { id: Date.now() + 2, emoji: '🩺', x: e.nativeEvent.offsetX + 20, y: e.nativeEvent.offsetY - 40 },
      { id: Date.now() + 3, emoji: '❤️', x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY - 50 },
    ];
    setSparkles((prev) => [...prev, ...newSparkles]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => !newSparkles.some((ns) => ns.id === s.id)));
    }, 1200);

    const quotes = [
      "Hello there! I am Dr. Meddy! I'm watching your symptoms closely!",
      "Turn on Google Camera Live so I can visually inspect your cuts or burns!",
      "If you're bleeding, remember: apply firm direct pressure for 10 full minutes!",
      "I'm powered by Gemini 3.7 Vision AI for real-time campus triage guidance!",
      "Stay calm! If it's a severe emergency, tap the red One-Tap SOS button!",
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setMascotQuote(randomQuote);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(randomQuote);
      utt.pitch = 1.25;
      utt.rate = 1.05;
      window.speechSynthesis.speak(utt);
    }
  };

  const displayMessage = mascotQuote || message;

  if (compactMode) {
    return (
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => {
          setIsHovered(true);
          setIsWaving(true);
          setTimeout(() => setIsWaving(false), 2000);
        }}
        onMouseLeave={handleMouseLeave}
        onClick={handleMascotClick}
        className="glass-panel rounded-2xl p-3 border border-cyan-400/50 bg-[#070b16]/95 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.9)] flex items-center gap-3 cursor-pointer group hover:scale-[1.02] transition-all max-w-md relative overflow-hidden text-left"
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

        <div
          className={`w-14 h-14 rounded-full bg-[#0d1120] border-2 border-cyan-400 relative flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.5)] ${
            isBouncing ? 'animate-happy-bounce' : 'animate-float-3d'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute top-0 right-0" />
          <svg viewBox="0 0 200 200" className={`w-11 h-11 ${status === 'SPEAKING' ? 'animate-bounce' : ''}`}>
            <circle cx="100" cy="100" r="60" fill="#252d42" stroke="#38bdf8" strokeWidth="6" />
            <ellipse cx="100" cy="98" rx="45" ry="30" fill="#081e36" stroke="#60a5fa" strokeWidth="4" />
            <g fill="#38bdf8">
              <circle cx={78 + mouseOffset.x * 6} cy={92 + mouseOffset.y * 4} r="10" />
              <circle cx={122 + mouseOffset.x * 6} cy={92 + mouseOffset.y * 4} r="10" />
              <circle cx={81 + mouseOffset.x * 6} cy={88 + mouseOffset.y * 4} r="3.5" fill="#ffffff" />
              <circle cx={125 + mouseOffset.x * 6} cy={88 + mouseOffset.y * 4} r="3.5" fill="#ffffff" />
            </g>
            <path d="M 80 112 Q 100 124 120 112" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
            {isWaving && (
              <g className="animate-wave-arm">
                <path d="M 160 110 Q 185 80 175 60" fill="none" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
                <circle cx="175" cy="58" r="8" fill="#60a5fa" />
              </g>
            )}
          </svg>
        </div>

        <div className="flex flex-col text-left space-y-1 min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-[11px] font-bold text-cyan-300 uppercase flex items-center gap-1">
              <span>DR. MEDDY 🩺</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-[9px] text-cyan-200">
                {status}
              </span>
            </span>
            <span className="text-[10px] font-mono-code text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-xs text-[#e1e3e4] line-clamp-2 leading-snug">
            "{displayMessage}"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovered(true);
        setIsWaving(true);
        setTimeout(() => setIsWaving(false), 2000);
      }}
      onMouseLeave={handleMouseLeave}
      className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/25 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] bg-gradient-to-r from-[#070913] via-[#0d1222] to-[#060812] transition-transform duration-200 ease-out"
      style={{
        transform: `perspective(1000px) rotateY(${mouseOffset.x * 8}deg) rotateX(${-mouseOffset.y * 8}deg)`,
      }}
    >
      {/* Dynamic Ambient Sci-Fi Glows */}
      <div
        className="absolute -top-28 -left-28 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none transition-all duration-300"
        style={{
          transform: `translate(${mouseOffset.x * 30}px, ${mouseOffset.y * 30}px)`,
        }}
      />
      <div
        className="absolute -bottom-28 -right-28 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none transition-all duration-300"
        style={{
          transform: `translate(${-mouseOffset.x * 30}px, ${-mouseOffset.y * 30}px)`,
        }}
      />

      {/* 3D Holographic Grid Layer */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid3dMascot" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#4d8eff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid3dMascot)" />
        </svg>
      </div>

      {/* Floating Sparkle Particles on Click */}
      {sparkles.map((sp) => (
        <span
          key={sp.id}
          className="absolute z-50 text-xl pointer-events-none animate-bounce"
          style={{ left: sp.x, top: sp.y, transition: 'all 0.5s ease-out' }}
        >
          {sp.emoji}
        </span>
      ))}

      {/* Mascot Avatar 3D Floating Box */}
      <div className="flex flex-col items-center text-center gap-3 relative z-10 flex-shrink-0">
        <div
          onClick={handleMascotClick}
          className={`relative cursor-pointer group transition-all duration-300 transform ${
            isBouncing ? 'animate-happy-bounce' : 'animate-float-3d'
          }`}
        >
          {/* Holographic Glowing Aura Ring */}
          <div
            className={`absolute -inset-4 rounded-full blur-xl transition-all duration-500 ${
              status === 'ANALYZING' || status === 'THINKING'
                ? 'bg-gradient-to-r from-amber-400 via-purple-500 to-cyan-400 animate-spin opacity-85'
                : status === 'ALERT'
                ? 'bg-red-500 animate-ping opacity-90'
                : isCameraActive
                ? 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 animate-pulse-glow opacity-90'
                : 'bg-gradient-to-r from-[#4d8eff] via-cyan-400 to-emerald-400 opacity-60 group-hover:opacity-100'
            }`}
          />

          {/* SVG Mascot Dr. Meddy Container */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-[#0d1120] border-2 border-cyan-400/60 relative flex items-center justify-center shadow-[0_0_30px_rgba(77,142,255,0.4)] overflow-hidden p-2">
            <svg
              viewBox="0 0 200 200"
              className={`w-full h-full transition-transform duration-300 ${
                status === 'SPEAKING' || isCameraActive ? 'animate-bounce' : ''
              }`}
            >
              <defs>
                <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#252d42" />
                  <stop offset="100%" stopColor="#0c101c" />
                </linearGradient>
                <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#081e36" />
                  <stop offset="100%" stopColor="#020d18" />
                </linearGradient>
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Antenna Laser Beacon */}
              <circle cx="100" cy="20" r="10" fill="#38bdf8" className="animate-ping" opacity="0.6" />
              <line x1="100" y1="20" x2="100" y2="44" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
              <circle cx="100" cy="20" r="7" fill="#60a5fa" />
              <circle cx="100" cy="20" r="3" fill="#ffffff" />

              {/* Headphones / Ear Pods */}
              <rect x="22" y="78" width="18" height="38" rx="9" fill="#38bdf8" />
              <rect x="160" y="78" width="18" height="38" rx="9" fill="#38bdf8" />

              {/* Robot Head Outer Shell */}
              <ellipse
                cx="100"
                cy="98"
                rx="68"
                ry="58"
                fill="url(#headGrad)"
                stroke="#38bdf8"
                strokeWidth="3.5"
                style={{
                  transform: `translate(${mouseOffset.x * 3}px, ${mouseOffset.y * 3}px)`,
                  transition: 'transform 0.1s ease-out',
                }}
              />

              {/* Visor Screen */}
              <ellipse
                cx="100"
                cy="96"
                rx="52"
                ry="36"
                fill="url(#visorGrad)"
                stroke="#60a5fa"
                strokeWidth="2"
                style={{
                  transform: `translate(${mouseOffset.x * 5}px, ${mouseOffset.y * 5}px)`,
                  transition: 'transform 0.1s ease-out',
                }}
              />

              {/* DYNAMIC EYE TRACKING CURSOR */}
              {status === 'THINKING' || status === 'ANALYZING' ? (
                <g fill="none" stroke="#38bdf8" strokeWidth="4" className="animate-spin">
                  <circle cx="78" cy="92" r="10" strokeDasharray="15 10" />
                  <circle cx="122" cy="92" r="10" strokeDasharray="15 10" />
                </g>
              ) : (
                <g fill="#38bdf8">
                  {/* Left Eye Track */}
                  <circle cx={78 + mouseOffset.x * 8} cy={92 + mouseOffset.y * 6} r="12" />
                  <circle cx={82 + mouseOffset.x * 8} cy={88 + mouseOffset.y * 6} r="4" fill="#ffffff" />

                  {/* Right Eye Track */}
                  <circle cx={122 + mouseOffset.x * 8} cy={92 + mouseOffset.y * 6} r="12" />
                  <circle cx={126 + mouseOffset.x * 8} cy={88 + mouseOffset.y * 6} r="4" fill="#ffffff" />
                </g>
              )}

              {/* Digital Doctor Smile */}
              <path
                d={
                  isWaving || status === 'SPEAKING'
                    ? "M 76 110 Q 100 128 124 110"
                    : "M 80 112 Q 100 124 120 112"
                }
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Cute Cheek Blushes */}
              <ellipse cx="58" cy="106" rx="8" ry="4" fill="#ff7ce5" opacity="0.7" />
              <ellipse cx="142" cy="106" rx="8" ry="4" fill="#ff7ce5" opacity="0.7" />

              {/* WAVING ROBOT ARM */}
              {isWaving && (
                <g className="animate-wave-arm">
                  <path
                    d="M 160 110 Q 185 80 175 60"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <circle cx="175" cy="58" r="10" fill="#60a5fa" />
                  <text x="170" y="42" fontSize="16">👋</text>
                </g>
              )}

              {/* Doctor Stethoscope */}
              <path
                d="M 48 142 C 48 182, 152 182, 152 142"
                fill="none"
                stroke="#adc6ff"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Red Cross Heart Chest Badge */}
              <circle cx="100" cy="164" r="14" fill="#ef4444" filter="url(#neonGlow)" />
              <rect x="96" y="156" width="8" height="16" rx="2" fill="#ffffff" />
              <rect x="92" y="160" width="16" height="8" rx="2" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* Mascot Name Badge & Status */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12182b] border border-cyan-500/40 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono-code text-xs font-bold text-[#adc6ff]">DR. MEDDY</span>
            <span className="text-[10px] text-cyan-400 font-mono-code">AI DOCTOR</span>
          </div>
          <span className="text-[11px] text-[#8c909f] mt-1 font-mono-code">
            {isHovered ? '👋 Waving! Tap to speak' : 'Move cursor or tap Dr. Meddy'}
          </span>
        </div>
      </div>

      {/* Speech Bubble & Interactive Controls */}
      <div className="flex-1 space-y-4 text-left relative z-10 w-full">
        {/* Speech Bubble */}
        <div className="relative bg-[#0c101d]/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 shadow-2xl">
          <div className="hidden md:block absolute -left-3 top-6 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-[#0c101d]" />

          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono-code text-xs font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base animate-spin">cyclone</span>
                  {status === 'ANALYZING'
                    ? '🔍 Analyzing Live Camera Scan & Pain...'
                    : status === 'SPEAKING'
                    ? '🗣️ Dr. Meddy Speaking Live'
                    : isCameraActive
                    ? '📷 Google Camera Live Active'
                    : '🩺 AI Doctor & First-Aid Guide'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-[#4d8eff]/20 text-[#adc6ff]">
                  Gemini 3.7 Vision
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">verified_user</span>
                  Safety Guardrails Active
                </span>
              </div>
              <p className="text-sm sm:text-base font-medium text-[#e1e3e4] leading-relaxed">
                "{displayMessage}"
              </p>
            </div>

            {/* Google Camera Live Button */}
            {onToggleCameraLive && (
              <button
                onClick={onToggleCameraLive}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono-code font-extrabold flex items-center gap-2 transition-all cursor-pointer flex-shrink-0 shadow-lg ${
                  isCameraActive
                    ? 'bg-red-500/30 text-red-300 border border-red-500 animate-pulse'
                    : 'bg-gradient-to-r from-cyan-500 via-[#4d8eff] to-blue-600 text-[#001d4a] hover:brightness-110 shadow-cyan-500/20'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {isCameraActive ? 'videocam_off' : 'videocam'}
                </span>
                <span className="hidden sm:inline">
                  {isCameraActive ? 'CLOSE CAMERA' : 'GOOGLE CAMERA LIVE'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Action Chips */}
        {onQuickAction && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-mono-code text-[#8c909f] uppercase mr-1">
              Quick Medical Check:
            </span>
            <button
              onClick={() => onQuickAction('I am bleeding from a cut or wound. How do I stop it?')}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-300 text-xs font-mono-code font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
            >
              <span>🩸</span>
              <span>Bleeding & Cuts</span>
            </button>

            <button
              onClick={() => onQuickAction('I have severe pain (Level 7/10). What should I do?')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-mono-code font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
            >
              <span>⚡</span>
              <span>Pain Scale (1-10)</span>
            </button>

            <button
              onClick={() => onQuickAction('I burned my hand. How do I treat thermal burn?')}
              className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-300 text-xs font-mono-code font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
            >
              <span>🔥</span>
              <span>Burn Care</span>
            </button>

            <button
              onClick={() => onQuickAction('I feel dizzy and lightheaded after a fall. What steps to take?')}
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-300 text-xs font-mono-code font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
            >
              <span>💫</span>
              <span>Dizziness & Fall</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
