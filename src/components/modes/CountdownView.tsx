'use client';

import { useTimer } from '@/context/TimerContext';
import { TimerDisplay } from '@/components/TimerDisplay';
import { MotionButton } from '@/components/shared/MotionButton';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { playComplete } from '@/utils/audio';

export default function CountdownView() {
  const { countdown } = useTimer();

  const remaining = countdown.duration - countdown.elapsed;
  const isOvertime = remaining < 0;
  const displayTime = isOvertime ? Math.abs(remaining) : remaining;
  
  const audioPlayedRef = useRef(false);

  // Input state
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Sync input with duration when not focused
  useEffect(() => {
    if (!isFocused) {
      const mins = countdown.duration / 60000;
      // Remove trailing zeros by simple string conversion
      setInputValue(mins.toString());
    }
  }, [countdown.duration, isFocused]);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
       countdown.setDuration(num * 60000);
    }
  };

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
  
  const adjustTime = (ms: number) => {
     if (countdown.isRunning) return; // Prevent jumping while running for now
     countdown.setDuration(Math.max(0, countdown.duration + ms));
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4">
      {/* Main Section: Timer & Primary Controls */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
         <TimerDisplay 
            ms={displayTime} 
            totalMs={countdown.duration} 
            mode="countdown" 
            overtime={isOvertime}
         />

         {/* Controls */}
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
      </div>

      {/* Side Section: Configuration */}
      <div className="w-full lg:w-64 flex flex-col gap-8 z-20 lg:border-l-2 lg:border-foreground/10 lg:pl-8 lg:self-center">
          
          {/* Duration Input */}
          <div className="flex flex-col gap-3 w-full">
              <label htmlFor="duration-input" className="text-xs font-mono uppercase tracking-widest opacity-50 text-center lg:text-left">
                Duration (min)
              </label>
              <input
                id="duration-input"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={inputValue}
                onChange={handleDurationChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full bg-transparent border-2 border-foreground p-3 font-mono text-xl text-center bauhaus-shadow-sm focus:outline-none focus:ring-2 focus:ring-bauhaus-blue transition-all placeholder:text-foreground/30"
                placeholder="0"
              />
          </div>
          
           {/* Adjustments */}
           <div className="flex flex-col gap-3 w-full pt-4 border-t border-foreground/10 lg:border-none lg:pt-0">
              <p className="text-xs font-mono uppercase tracking-widest opacity-50 text-center lg:text-left">Adjust</p>
               <div className="flex flex-col gap-3">
                   <div className="flex gap-2 w-full">
                      <MotionButton size="sm" variant="ghost" className="flex-1" onClick={() => adjustTime(-60000)} disabled={countdown.isRunning}>
                        <Minus className="w-3 h-3 mr-1"/> 1m
                      </MotionButton>
                      <MotionButton size="sm" variant="ghost" className="flex-1" onClick={() => adjustTime(60000)} disabled={countdown.isRunning}>
                        <Plus className="w-3 h-3 mr-1"/> 1m
                      </MotionButton>
                   </div>
                   <MotionButton size="sm" variant="ghost" className="w-full" onClick={() => adjustTime(5 * 60000)} disabled={countdown.isRunning}>
                      <Plus className="w-3 h-3 mr-1"/> 5m
                   </MotionButton>
               </div>
           </div>
      </div>
    </div>
  );
}
