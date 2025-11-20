type AudioContextConstructor = typeof AudioContext;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  const ctor: AudioContextConstructor | undefined =
    window.AudioContext ||
    (window as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
  if (!ctor) return null;
  return new ctor();
};

export function playBeep(freq = 880, duration = 0.1, type: OscillatorType = 'sine') {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();

  // Smooth decay
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.stop(ctx.currentTime + duration);
}

export function playTick() {
    playBeep(1200, 0.05, 'triangle');
}

export function playComplete() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
         const osc = ctx.createOscillator();
         const gain = ctx.createGain();
         osc.frequency.value = freq;
         osc.type = 'square';
         
         osc.connect(gain);
         gain.connect(ctx.destination);
         
         osc.start(now + i * 0.1);
         gain.gain.setValueAtTime(0.1, now + i * 0.1);
         gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
         osc.stop(now + i * 0.1 + 0.3);
    });
}
