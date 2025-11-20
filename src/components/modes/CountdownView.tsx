'use client';

import { useTimer } from '@/context/TimerContext';
import { TimerDisplay } from '@/components/TimerDisplay';
import { MotionButton } from '@/components/shared/MotionButton';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { playComplete } from '@/utils/audio';

const PRESETS = [
  { label: '1m', value: 1 * 60 * 1000 },
  { label: '5m', value: 5 * 60 * 1000 },
  { label: '10m', value: 10 * 60 * 1000 },
  { label: '15m', value: 15 * 60 * 1000 },
  { label: '25m', value: 25 * 60 * 1000 },
  { label: '45m', value: 45 * 60 * 1000 },
];

export default function CountdownView() {
  const { countdown } = useTimer();

  const remaining = countdown.duration - countdown.elapsed;
  const isOvertime = remaining < 0;
  const displayTime = isOvertime ? Math.abs(remaining) : remaining;
  
  const audioPlayedRef = useRef(false);

  useEffect(() => {
     // Play sound when reaching 0 (or crossing it)
     if (remaining <= 0 && !audioPlayedRef.current && countdown.isRunning) {
         playComplete();
         audioPlayedRef.current = true;
     }
     // Reset flag if we go back above 0 (e.g. reset or add time)
     if (remaining > 0) {
         audioPlayedRef.current = false;
     }
  }, [remaining, countdown.isRunning]);
  
  const handlePreset = (ms: number) => {
    countdown.reset();
    countdown.setDuration(ms);
  };

  const adjustTime = (ms: number) => {
     if (countdown.isRunning) return; // Prevent jumping while running for now
     countdown.setDuration(Math.max(0, countdown.duration + ms));
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Timer Display */}
      <div className="w-full flex justify-center">
         <TimerDisplay 
            ms={displayTime} 
            totalMs={countdown.duration} 
            mode="countdown" 
            overtime={isOvertime}
         />
      </div>

      {/* Controls */}
      {/* Added relative z-20 to ensure controls sit above ring if it somehow overlaps, but main spacing fix in TimerDisplay handles layout flow. */}
      <div className="flex items-center justify-center gap-6 relative z-20 mt-4">
        <MotionButton 
          variant="ghost" 
          size="icon" 
          onClick={countdown.reset} 
          disabled={countdown.elapsed === 0}
          title="Reset"
        >
           <RotateCcw className="w-6 h-6" />
        </MotionButton>

        {countdown.isRunning ? (
          <MotionButton variant="secondary" size="lg" className="w-40" onClick={countdown.pause}>
            <Pause className="mr-2 w-5 h-5 fill-current" /> Pause
          </MotionButton>
        ) : (
          <MotionButton variant="primary" size="lg" className="w-40" onClick={countdown.start}>
            <Play className="mr-2 w-5 h-5 fill-current" /> {countdown.elapsed > 0 ? 'Resume' : 'Start'}
          </MotionButton>
        )}
        
        {/* Placeholder to balance layout if reset button is on left */}
        <div className="w-12 h-12" /> 
      </div>

      {/* Presets */}
      <div className="w-full space-y-4 pt-8 border-t border-foreground/10">
          <p className="text-xs font-mono text-center uppercase tracking-widest opacity-50">Presets</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 w-full">
            {PRESETS.map(preset => (
              <MotionButton 
                key={preset.label} 
                variant="secondary" 
                size="sm"
                onClick={() => handlePreset(preset.value)}
                className="font-normal"
              >
                {preset.label}
              </MotionButton>
            ))}
          </div>
      </div>
      
       {/* Adjustments */}
       <div className="flex gap-4 justify-center">
          <MotionButton size="sm" variant="ghost" onClick={() => adjustTime(-60000)} disabled={countdown.isRunning}><Minus className="w-3 h-3 mr-1"/> 1m</MotionButton>
          <MotionButton size="sm" variant="ghost" onClick={() => adjustTime(60000)} disabled={countdown.isRunning}><Plus className="w-3 h-3 mr-1"/> 1m</MotionButton>
          <MotionButton size="sm" variant="ghost" onClick={() => adjustTime(5 * 60000)} disabled={countdown.isRunning}><Plus className="w-3 h-3 mr-1"/> 5m</MotionButton>
       </div>
    </div>
  );
}
