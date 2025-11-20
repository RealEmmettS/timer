import { useState, useEffect, useRef, useCallback } from 'react';

export interface TimerEngine {
  elapsed: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setElapsedTime: (time: number) => void;
}

export function useTimerEngine(): TimerEngine {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const savedElapsedRef = useRef<number>(0);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker('/timer.worker.js');
    
    workerRef.current.onmessage = (e) => {
      if (e.data === 'TICK') {
        if (startTimeRef.current !== null) {
          const now = Date.now();
          const currentSessionElapsed = now - startTimeRef.current;
          setElapsed(savedElapsedRef.current + currentSessionElapsed);
        }
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const start = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    startTimeRef.current = Date.now();
    
    workerRef.current?.postMessage({ action: 'START' });
  }, [isRunning]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    
    setIsRunning(false);
    workerRef.current?.postMessage({ action: 'STOP' });
    
    // Commit the elapsed time
    if (startTimeRef.current !== null) {
      savedElapsedRef.current += Date.now() - startTimeRef.current;
      startTimeRef.current = null;
    }
  }, [isRunning]);

  const reset = useCallback(() => {
    setIsRunning(false);
    workerRef.current?.postMessage({ action: 'STOP' });
    savedElapsedRef.current = 0;
    startTimeRef.current = null;
    setElapsed(0);
  }, []);

  const setElapsedTime = useCallback((time: number) => {
      savedElapsedRef.current = time;
      setElapsed(time);
  }, []);

  return {
    elapsed,
    isRunning,
    start,
    pause,
    reset,
    setElapsedTime
  };
}

