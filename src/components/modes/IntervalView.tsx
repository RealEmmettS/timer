'use client';

import { useTimer } from '@/context/TimerContext';
import { TimerDisplay } from '@/components/TimerDisplay';
import { MotionButton } from '@/components/shared/MotionButton';
import { Play, Pause, RotateCcw, Settings2 } from 'lucide-react';
import { useState } from 'react';

export default function IntervalView() {
  const { interval } = useTimer();
  const [showConfig, setShowConfig] = useState(false);

  const { work, rest, rounds } = interval.config;
  const cycleTime = work + rest;
  
  // Calculate phase
  const currentCycleElapsed = interval.elapsed % cycleTime;
  const isWorkPhase = currentCycleElapsed < work;
  const phaseRemaining = isWorkPhase 
    ? work - currentCycleElapsed 
    : cycleTime - currentCycleElapsed;
    
  const isComplete = interval.elapsed >= (rounds * cycleTime);
  // If complete, show 0
  const displayMs = isComplete ? 0 : Math.max(0, phaseRemaining);
  
  const handleStart = () => {
      interval.start();
      setShowConfig(false);
  }
  
  // Allow editing config only when paused/reset
  const updateConfig = (key: keyof typeof interval.config, val: number) => {
      interval.setConfig({ ...interval.config, [key]: val });
  }

  // Show config if explicity requested OR if fresh state (elapsed 0 and not running)
  const isSetup = (interval.elapsed === 0 && !interval.isRunning) || showConfig;

  if (isSetup) {
      return (
          <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in pt-10">
             <div className="bg-white dark:bg-neutral-900 border-2 border-foreground bauhaus-shadow p-6 space-y-6">
                <h2 className="text-xl font-mono font-bold uppercase tracking-widest text-center">Interval Setup</h2>
                
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-sm font-mono uppercase">Work (sec)</label>
                        <input 
                             type="number" 
                             className="w-full p-3 border-2 border-foreground bg-transparent font-mono text-lg focus:ring-2 focus:ring-bauhaus-blue outline-none"
                             value={work / 1000}
                             onChange={(e) => updateConfig('work', Math.max(1, Number(e.target.value)) * 1000)}
                           />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-sm font-mono uppercase">Rest (sec)</label>
                         <input 
                             type="number" 
                             className="w-full p-3 border-2 border-foreground bg-transparent font-mono text-lg focus:ring-2 focus:ring-bauhaus-blue outline-none"
                             value={rest / 1000}
                             onChange={(e) => updateConfig('rest', Math.max(0, Number(e.target.value)) * 1000)}
                           />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-sm font-mono uppercase">Rounds</label>
                         <input 
                             type="number" 
                             className="w-full p-3 border-2 border-foreground bg-transparent font-mono text-lg focus:ring-2 focus:ring-bauhaus-blue outline-none"
                             value={rounds}
                             onChange={(e) => updateConfig('rounds', Math.max(1, Number(e.target.value)))}
                           />
                    </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                    {interval.elapsed > 0 && (
                         <MotionButton variant="ghost" className="flex-1" onClick={() => setShowConfig(false)}>
                            Cancel
                        </MotionButton>
                    )}
                    <MotionButton variant="primary" className="flex-1" onClick={() => setShowConfig(false)}>
                        Done
                    </MotionButton>
                </div>
             </div>
             
             {interval.elapsed === 0 && (
                <div className="flex justify-center">
                    <MotionButton variant="primary" size="lg" onClick={handleStart}>
                        <Play className="mr-2 w-5 h-5" /> Start Workout
                    </MotionButton>
                </div>
             )}
          </div>
      )
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center space-y-3">
          <div className={`font-mono text-sm font-bold uppercase tracking-widest px-4 py-1 border-2 border-foreground ${isWorkPhase ? 'bg-bauhaus-yellow text-black' : 'bg-bauhaus-blue text-white'}`}>
            {isComplete ? "Complete" : (isWorkPhase ? "Work" : "Rest")}
          </div>
          <span className="font-mono text-xs opacity-60">Round {interval.currentRound} / {rounds}</span>
      </div>
      
      <div className="w-full flex justify-center">
         <TimerDisplay 
            ms={displayMs} 
            totalMs={isWorkPhase ? work : rest}
            mode="interval" 
            ringColor={isComplete ? "var(--foreground)" : (isWorkPhase ? "var(--bauhaus-yellow)" : "var(--bauhaus-blue)")}
         />
      </div>

      <div className="flex items-center justify-center gap-6">
         <MotionButton 
          variant="ghost" 
          size="icon" 
          onClick={interval.reset} 
          title="Reset"
        >
           <RotateCcw className="w-6 h-6" />
        </MotionButton>

        {interval.isRunning ? (
          <MotionButton variant="secondary" size="lg" className="w-40" onClick={interval.pause}>
            <Pause className="mr-2 w-5 h-5 fill-current" /> Pause
          </MotionButton>
        ) : (
          <MotionButton variant="primary" size="lg" className="w-40" onClick={interval.start} disabled={isComplete}>
            <Play className="mr-2 w-5 h-5 fill-current" /> {isComplete ? 'Done' : 'Resume'}
          </MotionButton>
        )}
        
         <MotionButton 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowConfig(true)} 
          title="Config"
        >
           <Settings2 className="w-6 h-6" />
        </MotionButton>
      </div>
    </div>
  );
}

