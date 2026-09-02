let globalAudioCtx: AudioContext | null = null;
let activeSirenInterval: any = null;

function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
      globalAudioCtx = new AudioContextClass();
    }
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume().catch(() => {});
    }
    return globalAudioCtx;
  } catch (e) {
    return null;
  }
}

export function playEmergencyBeep() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Beep 1 (High Alarm 960 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(960, now);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Beep 2 (Very High Alarm 1240 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1240, now + 0.35);
    gain2.gain.setValueAtTime(0.5, now + 0.35);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.35);
    osc2.stop(now + 0.7);

    // Beep 3 (Siren Sweep)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'square';
    osc3.frequency.setValueAtTime(800, now + 0.75);
    osc3.frequency.linearRampToValueAtTime(1400, now + 1.1);
    gain3.gain.setValueAtTime(0.3, now + 0.75);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.25);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.75);
    osc3.stop(now + 1.25);
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

export function startContinuousSiren() {
  playEmergencyBeep();
  if (!activeSirenInterval) {
    activeSirenInterval = setInterval(() => {
      playEmergencyBeep();
    }, 1800);
  }
}

export function stopContinuousSiren() {
  if (activeSirenInterval) {
    clearInterval(activeSirenInterval);
    activeSirenInterval = null;
  }
}

