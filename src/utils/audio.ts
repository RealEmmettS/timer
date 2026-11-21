let context: AudioContext | undefined;

// Resume inside the Start gesture so a later timer alarm can sound on mobile.
export function prepareAudio() {
  try {
    const Context =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Context && !context) context = new Context();
    if (context && context.state === 'suspended') void context.resume().catch(() => {});
  } catch {
    /* The timer can run without audio output. */
  }
}

export function playComplete() {
  if (!context || context.state !== 'running') return;
  const now = context.currentTime;
  const ctx = context;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const note = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + i * 0.1;
    note.type = 'sine';
    note.frequency.value = freq;
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(0.13, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32);
    note.connect(gain).connect(ctx.destination);
    note.onended = () => {
      note.disconnect();
      gain.disconnect();
    };
    note.start(start);
    note.stop(start + 0.33);
  });
}
