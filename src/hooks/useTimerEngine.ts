import { useCallback, useEffect, useRef, useState } from 'react';

export function useTimerEngine(step = 1000, backgroundStep = step) {
  const [elapsed, setElapsed] = useState(0);
  const [origin, setOrigin] = useState<number | null>(null);
  const saved = useRef(0);
  const originRef = useRef<number | null>(null);

  const readElapsed = useCallback(
    () => (originRef.current === null ? saved.current : Math.max(0, Date.now() - originRef.current)),
    [],
  );

  useEffect(() => {
    if (origin === null || !step) return;
    const worker = new Worker('/timer.worker.js');
    function schedule() {
      const interval = document.hidden ? backgroundStep : step;
      worker.postMessage({ action: interval ? 'START' : 'STOP', interval, origin });
    }
    worker.onmessage = () => {
      if (originRef.current === origin) setElapsed(readElapsed());
    };
    schedule();
    document.addEventListener('visibilitychange', schedule);
    return () => {
      document.removeEventListener('visibilitychange', schedule);
      worker.terminate();
    };
  }, [origin, step, backgroundStep, readElapsed]);

  const start = () => {
    if (originRef.current !== null) return;
    originRef.current = Date.now() - saved.current;
    setOrigin(originRef.current);
  };
  const stopAt = useCallback((time: number) => {
    saved.current = time;
    originRef.current = null;
    setOrigin(null);
    setElapsed(time);
  }, []);
  return {
    elapsed,
    isRunning: origin !== null,
    start,
    readElapsed,
    stopAt,
    pause: () => stopAt(readElapsed()),
    reset: () => stopAt(0),
  };
}
