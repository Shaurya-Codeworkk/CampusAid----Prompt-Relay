import React, { useState, useEffect, useRef } from 'react';
import { AccessibilityConfig } from '../types';
import { AiDoctorMascot } from './AiDoctorMascot';

interface AiHealthGuideProps {
  accessibility: AccessibilityConfig;
  onUpdateAccessibility: (config: Partial<AccessibilityConfig>) => void;
  onTriggerSos?: () => void;
}

interface GuideResponse {
  understand: string;
  doNow: string[];
  avoid: string[];
  humanHelp: string[];
}

export const AiHealthGuide: React.FC<AiHealthGuideProps> = ({
  accessibility,
  onUpdateAccessibility,
  onTriggerSos,
}) => {
  const [prompt, setPrompt] = useState('');
  const [painLevel, setPainLevel] = useState<number>(3);
  const [selectedSymptom, setSelectedSymptom] = useState<string>('General Pain');
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<GuideResponse | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSimulatedCamera, setIsSimulatedCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: 'user' | 'doctor'; text: string; timestamp: string }>
  >([]);

  // Video & Canvas Refs for Google Camera Live
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simulatedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Animated Simulated Medical Camera Loop
  useEffect(() => {
    let animId: number;
    let angle = 0;

    const renderSimulatedFeed = () => {
      if (isSimulatedCamera && simulatedCanvasRef.current) {
        const canvas = simulatedCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Dark cyber background
          ctx.fillStyle = '#060a14';
          ctx.fillRect(0, 0, w, h);

          // Grid lines
          ctx.strokeStyle = '#10192e';
          ctx.lineWidth = 1;
          for (let x = 0; x < w; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
          }
          for (let y = 0; y < h; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }

          // Simulated thermal wound pulse in center
          const pulse = Math.sin(Date.now() / 300) * 8;
          const radGrad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, 70 + pulse);
          radGrad.addColorStop(0, '#ef4444');
          radGrad.addColorStop(0.4, '#b91c1c');
          radGrad.addColorStop(0.8, '#450a0a');
          radGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.ellipse(w / 2, h / 2, 85 + pulse, 50 + pulse, Math.PI / 12, 0, Math.PI * 2);
          ctx.fill();

          // Radar line rotation
          angle += 0.03;
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.rotate(angle);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -120);
          ctx.stroke();
          ctx.restore();

          // Live HUD Text Overlay
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 12px monospace';
          ctx.fillText('GOOGLE MULTIMODAL CAMERA SIMULATOR', 20, 30);
          ctx.fillStyle = '#34d399';
          ctx.fillText('THERMAL SCAN: 38.4°C (INFLAMED WOUND)', 20, 50);
          ctx.fillStyle = '#f87171';
          ctx.fillText('STATUS: BLEEDING / TISSUE DAMAGE DETECTED', 20, 70);
        }
      }
      if (isSimulatedCamera) {
        animId = requestAnimationFrame(renderSimulatedFeed);
      }
    };

    if (isSimulatedCamera) {
      renderSimulatedFeed();
    }
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isSimulatedCamera]);

  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const recognitionRef = useRef<any>(null);

  // Toggle Continuous Microphone Speech Recognition
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type your question in the box.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setPrompt(currentTranscript);
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error('Speech recognition start error:', err);
        setIsListening(false);
      }
    }
  };

  // Toggle Camera Stream with Explicit Camera + Mic Permission Request
  const handleToggleCameraLive = async () => {
    if (isCameraActive) {
      stopCameraStream();
    } else {
      setCameraError(null);
      setIsSimulatedCamera(false);
      try {
        let stream: MediaStream | null = null;
        try {
          // Explicitly request both video AND audio to trigger standard browser permission dialog
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true,
          });
        } catch (e1) {
          console.warn('Video + Audio request failed, trying video only:', e1);
          // Fallback to video only
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        streamRef.current = stream;
        setIsSimulatedCamera(false);
        setIsCameraActive(true);

        // Attach stream if video element is already mounted
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => console.warn('Video play error:', err));
        }

        // Auto-start microphone dictation if available
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          toggleListening();
        }
      } catch (err: any) {
        console.warn('Camera live access restricted or denied:', err?.name, err?.message);
        setCameraError(
          err?.name === 'NotAllowedError' || err?.message?.includes('Permission denied')
            ? 'Camera / Microphone permission was denied by the browser or iframe policy.'
            : 'Could not access hardware camera directly.'
        );
        setIsCameraActive(true);
      }
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsSimulatedCamera(false);
  };

  // Ensure camera stream stays attached to video element when DOM mounts
  useEffect(() => {
    if (isCameraActive && !isSimulatedCamera && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch((err) => console.warn('Video play error:', err));
      }
    }
  }, [isCameraActive, isSimulatedCamera]);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Capture Camera Frame to Image
  const captureCameraFrame = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (!isSimulatedCamera && videoRef.current && videoRef.current.videoWidth > 0) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        } else {
          // Draw high-tech simulated medical wound frame for demo
          ctx.fillStyle = '#070a14';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid pattern
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          for (let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
          }
          for (let j = 0; j < canvas.height; j += 40) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(canvas.width, j);
            ctx.stroke();
          }

          // Draw simulated burn/wound area
          const grad = ctx.createRadialGradient(320, 240, 5, 320, 240, 80);
          grad.addColorStop(0, '#ef4444');
          grad.addColorStop(0.5, '#991b1b');
          grad.addColorStop(1, '#450a0a');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(320, 240, 70, 45, Math.PI / 8, 0, Math.PI * 2);
          ctx.fill();

          // Target reticle
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(180, 120, 280, 240);

          ctx.fillStyle = '#38bdf8';
          ctx.font = '12px monospace';
          ctx.fillText('GOOGLE CAMERA LIVE — WOUND SCAN', 190, 110);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(dataUrl);
        handleSend(`[Google Camera Live Scan Attached] Please analyze the wound / cut / burn in this camera frame.`, dataUrl);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (messageText?: string, imageOverride?: string) => {
    const textToSend = messageText || prompt;
    const currentImg = imageOverride || imagePreview;
    if (!textToSend.trim() && !currentImg) return;

    const fullQuery = `[Pain Scale: ${painLevel}/10, Category: ${selectedSymptom}] ${textToSend}`;

    setIsLoading(true);

    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setConversationHistory((prev) => [
      ...prev,
      { role: 'user', text: textToSend, timestamp: userTimestamp },
    ]);

    try {
      const res = await fetch('/api/ai/health-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullQuery,
          image: currentImg,
          language: accessibility.language,
          simpleLanguage: accessibility.simpleLanguage,
        }),
      });

      const data: GuideResponse = await res.json();
      setResponse(data);

      const docTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setConversationHistory((prev) => [
        ...prev,
        {
          role: 'doctor',
          text: `${data.understand} Steps: ${data.doNow.join(' ')}`,
          timestamp: docTimestamp,
        },
      ]);

      speakDoctorResponse(data);
    } catch (err) {
      console.error('Error fetching AI health guide:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const speakDoctorResponse = (guideData: GuideResponse) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `${guideData.understand}. ${guideData.doNow[0] || ''}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      if (accessibility.language === 'Hindi') {
        utterance.lang = 'hi-IN';
      }
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleReadAloud = () => {
    if (!response) return;
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      speakDoctorResponse(response);
    }
  };

  const getPainColor = (level: number) => {
    if (level <= 3) return 'text-emerald-400 border-emerald-500 bg-emerald-500/20';
    if (level <= 6) return 'text-amber-400 border-amber-500 bg-amber-500/20';
    return 'text-red-400 border-red-500 bg-red-500/20 animate-pulse';
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-32 flex flex-col gap-8 text-left relative z-10">
      {/* 3D Dynamic Animated Cyber-Medical Grid Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-30">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#4d8eff]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-2/3 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px]" />
      </div>

      {/* Hidden Canvas for Camera Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* CUTE AI DOCTOR MASCOT HERO BANNER */}
      <AiDoctorMascot
        status={isLoading ? 'ANALYZING' : isSpeaking ? 'SPEAKING' : 'IDLE'}
        message={
          response
            ? response.understand
            : accessibility.language === 'Hindi'
            ? 'नमस्ते! मैं गूगल लाइव एआई गाइड (एआई डॉक्टर) हूँ 🩺। कैमरा ऑन करें ताकि मैं आपके घाव और चोट का लाइव विश्लेषण कर सकूँ।'
            : "Hello! I am your Google Live AI Guide & AI Doctor 🩺. Turn on Google Camera Live so I can visually inspect cuts, bleeding, and thermal burns live!"
        }
        onQuickAction={(actionText) => {
          setPrompt(actionText);
          handleSend(actionText);
        }}
        onToggleCameraLive={handleToggleCameraLive}
        isCameraActive={isCameraActive}
      />

      {/* GOOGLE CAMERA LIVE VIDEO HUD SCANNER CONTAINER */}
      {isCameraActive && (
        <div className="glass-panel rounded-3xl p-6 border-2 border-[#4d8eff]/60 bg-[#0b0e19]/95 backdrop-blur-xl shadow-2xl space-y-4 animate-fade-in relative overflow-hidden">
          {/* Futuristic Scanning HUD Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="font-mono-code text-xs font-bold text-[#adc6ff] uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#4d8eff]">center_focus_strong</span>
                GOOGLE CAMERA LIVE SCANNER — MULTIMODAL VISION
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono-code text-[11px]">
              {isSimulatedCamera ? (
                <button
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30 transition-all cursor-pointer flex items-center gap-1 font-bold"
                >
                  <span>SIMULATED FEED (ENABLE WEBCAM ↗)</span>
                </button>
              ) : (
                <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE 1080P WEBCAM FEED
                </span>
              )}
            </div>
          </div>

          {/* Hidden File Input for Wound Photo Upload */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                  const dataUrl = evt.target?.result as string;
                  setImagePreview(dataUrl);
                  handleSend(`[Uploaded Image Attached] Please analyze the wound / cut / burn in this uploaded image.`, dataUrl);
                };
                reader.readAsDataURL(file);
              }
            }}
          />

          {/* Camera / Mic Permission Error Callout Box */}
          {cameraError && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-left space-y-3">
              <div className="flex items-start gap-2 text-amber-300 font-mono-code text-xs">
                <span className="material-symbols-outlined text-lg text-amber-400">videocam_off</span>
                <div>
                  <h5 className="font-bold text-amber-200 text-sm">Camera & Microphone Access Required</h5>
                  <p className="text-xs text-amber-300/90 mt-0.5">{cameraError}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleToggleCameraLive}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black font-mono-code text-xs font-bold hover:bg-amber-300 transition-all cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <span className="material-symbols-outlined text-sm">videocam</span>
                  <span>GRANT CAMERA PERMISSION</span>
                </button>

                <button
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono-code text-xs font-bold hover:bg-cyan-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  <span>OPEN IN NEW TAB (PROMPT POPUP)</span>
                </button>

                <button
                  onClick={() => {
                    setIsSimulatedCamera(true);
                    setCameraError(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white/90 hover:bg-white/20 font-mono-code text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">developer_board</span>
                  <span>USE SIMULATED DEMO HUD</span>
                </button>
              </div>
            </div>
          )}

          {/* Video Stream Feed Container with Sci-Fi Scanner Overlay */}
          <div className="relative aspect-video max-h-[420px] w-full rounded-2xl bg-black overflow-hidden border border-white/20 shadow-inner flex items-center justify-center">
            {isSimulatedCamera ? (
              <canvas
                ref={simulatedCanvasRef}
                width={640}
                height={480}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el && streamRef.current && !isSimulatedCamera) {
                    if (el.srcObject !== streamRef.current) {
                      el.srcObject = streamRef.current;
                      el.play().catch((err) => console.warn('Video play error on ref attach:', err));
                    }
                  }
                }}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />
            )}

            {/* Sci-Fi Target Bounding Frame & Laser Scanner Line */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Laser Scan Line Animation */}
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#4d8eff] to-transparent shadow-[0_0_15px_#4d8eff] animate-bounce absolute top-1/2 -translate-y-1/2" />

              {/* Center Target Rect */}
              <div className="w-64 h-64 border-2 border-dashed border-[#4d8eff]/80 rounded-2xl relative flex items-center justify-center backdrop-blur-[1px]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0b0e19] px-2 text-[10px] font-mono-code text-[#adc6ff] border border-[#4d8eff]/40 rounded">
                  ALIGN INJURY / BLEEDING HERE
                </div>
                {/* Corner Bracket Accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
              </div>
            </div>

            {/* HUD Status Badges */}
            <div className="absolute top-4 left-4 font-mono-code text-[11px] text-white/90 bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#4d8eff]">camera</span>
              <span>
                {isSimulatedCamera ? 'SIMULATED LIVE HUD' : 'HARDWARE WEBCAM'} | MULTIMODAL SCAN: READY
              </span>
            </div>

            {/* FLOATING CORNER 3D MASCOT OVERLAY INSIDE CAMERA HUD */}
            <div className="absolute bottom-4 right-4 z-30 pointer-events-auto max-w-xs sm:max-w-md">
              <AiDoctorMascot
                compactMode={true}
                status={isLoading ? 'ANALYZING' : isSpeaking ? 'SPEAKING' : 'IDLE'}
                message={
                  response
                    ? response.understand
                    : 'Align your cut, burn, or injury inside the target box and tap Analyze Frame!'
                }
              />
            </div>
          </div>

          {/* Live Camera Action Controls & Question Prompt */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask Dr. Meddy a question while showing your wound (e.g., 'How to treat this burn?')..."
                  className="w-full px-4 py-3 rounded-xl bg-[#080b14] border border-cyan-500/40 text-xs text-white placeholder-[#8c909f] focus:outline-none focus:border-cyan-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') captureCameraFrame();
                  }}
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  title="Toggle continuous voice dictation"
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono-code flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                      : 'bg-cyan-500/10 text-cyan-400 hover:text-white border-cyan-500/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{isListening ? 'mic' : 'mic_none'}</span>
                  <span>{isListening ? 'LISTENING...' : 'VOICE MIC'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={captureCameraFrame}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-[#00281b] font-mono-code text-xs font-extrabold hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <span className="material-symbols-outlined text-base">shutter_speed</span>
                  <span>{isLoading ? 'ANALYZING...' : 'ANALYZE FRAME & SPEAK'}</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono-code text-xs font-bold border border-cyan-500/40 transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Upload wound photo file"
                >
                  <span className="material-symbols-outlined text-base">upload_file</span>
                  <span>UPLOAD PHOTO</span>
                </button>

                <button
                  onClick={stopCameraStream}
                  className="px-3.5 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-mono-code text-xs font-bold border border-red-500/40 transition-colors cursor-pointer flex-shrink-0"
                >
                  CLOSE CAMERA
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#8c909f] font-mono-code flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#4d8eff]">info</span>
              Point your camera at the wound, cut, or burn. Dr. Meddy AI Doctor will analyze the image and speak the first-aid steps out loud!
            </p>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-mono-code flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {cameraError}
        </div>
      )}

      {/* Language & Accessibility Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#12141D] p-4 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#adc6ff]">medical_services</span>
          <div className="flex flex-col">
            <span className="font-mono-code text-xs font-bold text-[#e1e3e4] uppercase">
              GOOGLE LIVE AI GUIDE — AI DOCTOR INTERACTION
            </span>
            <span className="text-[10px] text-emerald-400 font-mono-code flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Strict Safety Guardrail: Medical & First-Aid Queries Only
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              onUpdateAccessibility({
                language: accessibility.language === 'English' ? 'Hindi' : 'English',
              })
            }
            className="px-3 py-1.5 rounded-xl bg-[#1d2021] border border-white/10 hover:bg-[#282a2b] text-xs font-mono-code font-bold text-[#adc6ff] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-sm">translate</span>
            {accessibility.language === 'English' ? 'EN' : 'हिंदी'}
          </button>

          <button
            onClick={() =>
              onUpdateAccessibility({ simpleLanguage: !accessibility.simpleLanguage })
            }
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono-code font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              accessibility.simpleLanguage
                ? 'bg-[#df7412]/20 text-[#ffb786] border-[#df7412]/40'
                : 'bg-[#1d2021] text-[#c2c6d6] border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-sm">nature_people</span>
            {accessibility.simpleLanguage ? 'SIMPLE WORDS: ON' : 'SIMPLE WORDS'}
          </button>
        </div>
      </div>

      {/* PAIN & SYMPTOM INPUT INTERFACE */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 bg-[#0e1220]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-[#e1e3e4] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4d8eff]">vital_signs</span>
              ANALYZE PAIN, WOUNDS & BLOOD
            </h2>
            <p className="text-xs text-[#8c909f] mt-1">
              Specify your pain score, pick symptom type, or use Google Camera Live for Dr. Meddy to inspect.
            </p>
          </div>

          {/* Pain Scale Selector */}
          <div className="w-full sm:w-auto flex items-center gap-3 bg-[#0c0f10] p-3 rounded-2xl border border-white/10">
            <span className="font-mono-code text-xs font-bold text-[#8c909f] uppercase">
              PAIN LEVEL:
            </span>
            <input
              type="range"
              min={1}
              max={10}
              value={painLevel}
              onChange={(e) => setPainLevel(parseInt(e.target.value))}
              className="w-28 accent-[#4d8eff] cursor-pointer"
            />
            <span
              className={`px-3 py-1 rounded-xl font-mono-code text-xs font-bold border ${getPainColor(
                painLevel
              )}`}
            >
              {painLevel}/10 {painLevel >= 8 ? 'CRITICAL' : painLevel >= 5 ? 'MODERATE' : 'MILD'}
            </span>
          </div>
        </div>

        {/* Symptom Category Chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: '🩸 Blood / Cut', val: 'Bleeding Wounds' },
            { label: '🔥 Thermal Burn', val: 'Burn Exposure' },
            { label: '🦴 Fall / Joint Pain', val: 'Physical Injury' },
            { label: '🌀 Dizziness / Fainting', val: 'Dizziness & Nausea' },
            { label: '🧪 Allergy / Rash', val: 'Allergic Reactions' },
          ].map((sym) => (
            <button
              key={sym.val}
              onClick={() => setSelectedSymptom(sym.val)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-mono-code font-bold transition-all cursor-pointer ${
                selectedSymptom === sym.val
                  ? 'bg-[#4d8eff]/20 text-[#adc6ff] border-[#4d8eff]'
                  : 'bg-[#12141D] text-[#8c909f] border-white/10 hover:text-white'
              }`}
            >
              {sym.label}
            </button>
          ))}
        </div>

        {/* Text Area & Media Upload */}
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder={
              accessibility.language === 'Hindi'
                ? 'अपनी स्थिति, दर्द का स्थान या चोट के बारे में डॉ. मेडी को बताएं...'
                : 'Tell Dr. Meddy what happened (e.g., bleeding cut on thumb, severe throbbing headache, ankle sprain)...'
            }
            className="w-full bg-[#070913] border border-white/10 rounded-2xl p-4 text-sm text-[#e1e3e4] placeholder-[#8c909f] focus:outline-none focus:ring-2 focus:ring-[#4d8eff]"
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Camera / Image attachment */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleToggleCameraLive}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4d8eff]/20 to-cyan-500/20 border border-[#4d8eff]/40 hover:bg-[#4d8eff]/30 text-xs text-[#adc6ff] font-mono-code font-bold cursor-pointer flex items-center gap-2 transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-base text-[#4d8eff]">videocam</span>
                {isCameraActive ? 'HIDE CAMERA' : 'GOOGLE CAMERA LIVE'}
              </button>

              <input
                type="file"
                accept="image/*"
                id="guide-image"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="guide-image"
                className="px-4 py-2.5 rounded-xl bg-[#1d2021] hover:bg-[#282a2b] border border-white/10 text-xs text-[#e1e3e4] font-mono-code font-bold cursor-pointer flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-base">photo_camera</span>
                UPLOAD PHOTO
              </label>

              {imagePreview && (
                <div className="flex items-center gap-2">
                  <img
                    src={imagePreview}
                    alt="Wound Attachment"
                    className="w-10 h-10 object-cover rounded-lg border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(undefined)}
                    className="text-xs text-[#ffb4ab] hover:underline font-mono-code"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleSend()}
                disabled={isLoading || (!prompt.trim() && !imagePreview)}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#4d8eff] text-[#00285d] font-mono-code text-xs font-extrabold hover:bg-[#adc6ff] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-[#00285d] border-t-transparent animate-spin" />
                    DR. MEDDY ANALYZING...
                  </span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">psychology</span>
                    ASK DR. MEDDY
                  </>
                )}
              </button>

              {/* Trigger Emergency SOS if needed */}
              {onTriggerSos && painLevel >= 7 && (
                <button
                  onClick={onTriggerSos}
                  className="px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-mono-code text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg animate-bounce"
                >
                  <span className="material-symbols-outlined text-base">emergency</span>
                  TRIGGER SOS
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONVERSATION HISTORY & TRIAGE OUTPUT */}
      {response && (
        <div className="space-y-6 animate-fade-in">
          {/* Read Aloud Bar */}
          <div className="flex items-center justify-between bg-[#12141D] p-4 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono-code text-xs text-[#adc6ff] font-bold uppercase">
                DR. MEDDY CLINICAL TRIAGE & LIVE GUIDANCE
              </span>
            </div>

            <button
              onClick={handleReadAloud}
              className="px-4 py-2 rounded-xl bg-[#4d8eff]/20 hover:bg-[#4d8eff]/30 text-[#adc6ff] font-mono-code text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-[#4d8eff]/30"
            >
              <span className="material-symbols-outlined text-base">
                {isSpeaking ? 'volume_off' : 'volume_up'}
              </span>
              {isSpeaking ? 'STOP DR. MEDDY VOICE' : 'LISTEN TO DR. MEDDY'}
            </button>
          </div>

          {/* Card 1: What Dr. Meddy Understands */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border-l-4 border-[#4d8eff] space-y-2 bg-[#0e1220]/90 backdrop-blur-xl">
            <h3 className="font-display text-sm font-bold text-[#adc6ff] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">medical_information</span>
              CLINICAL DIAGNOSIS & UNDERSTANDING
            </h3>
            <p className="text-base font-semibold text-white leading-relaxed">
              {response.understand}
            </p>
          </div>

          {/* Card 2: Immediate Action Steps */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border-l-4 border-emerald-500 space-y-4 bg-[#0e1220]/90 backdrop-blur-xl">
            <h3 className="font-display text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              WHAT YOU SHOULD DO NOW (STEP-BY-STEP)
            </h3>
            <ol className="space-y-3">
              {response.doNow.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[#e1e3e4]">
                  <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono-code text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/30">
                    {idx + 1}
                  </span>
                  <span className="mt-1 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Card 3: What to Avoid */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border-l-4 border-rose-500 space-y-4 bg-[#0e1220]/90 backdrop-blur-xl">
            <h3 className="font-display text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">cancel</span>
              WHAT TO AVOID (CRITICAL SAFETY NOTICE)
            </h3>
            <ul className="space-y-3">
              {response.avoid.map((avoidItem, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[#c2c6d6]">
                  <span className="material-symbols-outlined text-rose-400 text-base mt-0.5">
                    warning
                  </span>
                  <span className="leading-relaxed">{avoidItem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 4: Human Campus Emergency Help */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border-l-4 border-[#ffb786] space-y-4 bg-[#0e1220]/90 backdrop-blur-xl">
            <h3 className="font-display text-sm font-bold text-[#ffb786] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">local_hospital</span>
              WHEN TO CALL CAMPUS MEDICAL RESPONDERS
            </h3>
            <div className="text-sm text-white space-y-3">
              {response.humanHelp.map((help, idx) => (
                <p key={idx} className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffb786] flex-shrink-0" />
                  <span>{help}</span>
                </p>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-[#8c909f] font-mono-code">
                Campus Emergency Hotline: <span className="text-white font-bold">(555) 019-2834</span>
              </div>
              {onTriggerSos && (
                <button
                  onClick={onTriggerSos}
                  className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-mono-code text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <span className="material-symbols-outlined text-base">emergency</span>
                  TRIGGER SOS ALERT NOW
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MULTI-TURN CONVERSATION LOG */}
      {conversationHistory.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 space-y-4 bg-[#0e1220]/80 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-display text-sm font-bold text-[#adc6ff] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base">forum</span>
              CONSULTATION HISTORY WITH DR. MEDDY
            </h3>
            <span className="text-xs font-mono-code text-[#8c909f]">
              {conversationHistory.length} message(s)
            </span>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {conversationHistory.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                  item.role === 'user'
                    ? 'bg-[#181d2e] border border-[#4d8eff]/30 text-[#e1e3e4] ml-8'
                    : 'bg-[#12141D] border border-emerald-500/30 text-emerald-200 mr-8'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono-code text-[#8c909f]">
                  <span className="font-bold text-[#adc6ff]">
                    {item.role === 'user' ? '👤 YOU' : '🩺 DR. MEDDY'}
                  </span>
                  <span>{item.timestamp}</span>
                </div>
                <p className="leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FLOATING 3D MINI MASCOT CORNER ASSISTANT */}
      <button
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utt = new SpeechSynthesisUtterance("Dr. Meddy here! Need first aid advice or camera live analysis?");
            utt.pitch = 1.25;
            window.speechSynthesis.speak(utt);
          }
        }}
        title="Tap Dr. Meddy AI Assistant"
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#0d1222]/90 border border-cyan-400/50 backdrop-blur-xl shadow-[0_0_25px_rgba(56,189,248,0.4)] hover:scale-105 transition-all cursor-pointer animate-float-3d"
      >
        <div className="relative w-10 h-10 rounded-full bg-[#12182b] border border-cyan-400 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-0.5 right-0.5" />
          <svg viewBox="0 0 200 200" className="w-8 h-8 animate-pulse">
            <circle cx="100" cy="100" r="60" fill="#252d42" stroke="#38bdf8" strokeWidth="6" />
            <ellipse cx="100" cy="98" rx="45" ry="30" fill="#081e36" stroke="#60a5fa" strokeWidth="4" />
            <circle cx="82" cy="94" r="10" fill="#38bdf8" />
            <circle cx="118" cy="94" r="10" fill="#38bdf8" />
            <circle cx="85" cy="90" r="3" fill="#ffffff" />
            <circle cx="121" cy="90" r="3" fill="#ffffff" />
            <path d="M 85 110 Q 100 122 115 110" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="font-mono-code text-[11px] font-bold text-cyan-300 uppercase leading-none">
            DR. MEDDY 🩺
          </span>
          <span className="text-[10px] text-[#8c909f] font-mono-code">
            Tap for AI Doctor
          </span>
        </div>
      </button>
    </div>
  );
};


