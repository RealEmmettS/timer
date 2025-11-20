'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTimerEngine, TimerEngine } from '@/hooks/useTimerEngine';

type TimerMode = 'countdown' | 'stopwatch' | 'interval';

interface StopwatchState extends TimerEngine {
  laps: number[];
  addLap: () => void;
  clearLaps: () => void;
}

interface CountdownState extends TimerEngine {
  duration: number;
  setDuration: (ms: number) => void;
}

interface IntervalConfig {
  work: number;
  rest: number;
  rounds: number;
}

interface IntervalState extends TimerEngine {
  config: IntervalConfig;
  setConfig: (config: IntervalConfig) => void;
  currentRound: number;
  isWork: boolean;
}

interface TimerContextType {
  activeMode: TimerMode;
  setActiveMode: (mode: TimerMode) => void;
  stopwatch: StopwatchState;
  countdown: CountdownState;
  interval: IntervalState;
}

const TimerContext = createContext<TimerContextType | null>(null);

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [activeMode, setActiveMode] = useState<TimerMode>('countdown');

  // --- Stopwatch ---
  const stopwatchEngine = useTimerEngine();
  const [laps, setLaps] = useState<number[]>([]);
  
  const addLap = () => {
    setLaps(prev => [...prev, stopwatchEngine.elapsed]);
  };
  
  const clearLaps = () => {
    setLaps([]);
  };
  
  const { reset: stopwatchReset, ...restStopwatch } = stopwatchEngine;
  const resetStopwatchWithLaps = () => {
    stopwatchReset();
    clearLaps();
  };

  // --- Countdown ---
  const countdownEngine = useTimerEngine();
  const [countdownDuration, setCountdownDuration] = useState<number>(5 * 60 * 1000); // Default 5 min

  // --- Interval ---
  const intervalEngine = useTimerEngine();
  const [intervalConfig, setIntervalConfig] = useState<IntervalConfig>({
    work: 20 * 1000,
    rest: 10 * 1000,
    rounds: 8,
  });
  
  // Interval logic (calculating rounds/phase based on elapsed)
  // This is derived state usually, but for the API we expose it directly or helper functions.
  const totalCycleTime = intervalConfig.work + intervalConfig.rest;
  const currentRoundIndex = Math.floor(intervalEngine.elapsed / totalCycleTime);
  const timeInCurrentCycle = intervalEngine.elapsed % totalCycleTime;
  const isWork = timeInCurrentCycle < intervalConfig.work;
  
  // Auto-stop interval if done
  useEffect(() => {
    if (intervalEngine.isRunning && currentRoundIndex >= intervalConfig.rounds) {
      intervalEngine.pause();
      intervalEngine.setElapsedTime(intervalConfig.rounds * totalCycleTime);
    }
  }, [intervalEngine.elapsed, intervalEngine.isRunning, intervalConfig.rounds, totalCycleTime, currentRoundIndex, intervalEngine]);


  return (
    <TimerContext.Provider value={{
      activeMode,
      setActiveMode,
      stopwatch: {
        ...restStopwatch,
        reset: resetStopwatchWithLaps,
        laps,
        addLap,
        clearLaps
      },
      countdown: {
        ...countdownEngine,
        duration: countdownDuration,
        setDuration: setCountdownDuration
      },
      interval: {
        ...intervalEngine,
        config: intervalConfig,
        setConfig: setIntervalConfig,
        currentRound: Math.min(currentRoundIndex + 1, intervalConfig.rounds),
        isWork
      }
    }}>
      {children}
    </TimerContext.Provider>
  );
}
