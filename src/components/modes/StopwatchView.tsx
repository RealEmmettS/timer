'use client';

import { useTimer } from '@/context/TimerContext';
import { TimerDisplay } from '@/components/TimerDisplay';
import { MotionButton } from '@/components/shared/MotionButton';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StopwatchView() {
  const { stopwatch } = useTimer();

  // Format helper
  const formatTime = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    const centi = Math.floor((ms % 1000) / 10);
    return `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}.${centi.toString().padStart(2,'0')}`;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full flex justify-center">
        <TimerDisplay 
           ms={stopwatch.elapsed} 
           mode="stopwatch" 
           showMs 
        />
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
         <MotionButton 
          variant="ghost" 
          size="icon" 
          onClick={stopwatch.reset} 
          disabled={stopwatch.elapsed === 0}
          title="Reset"
        >
           <RotateCcw className="w-6 h-6" />
        </MotionButton>

        {stopwatch.isRunning ? (
          <MotionButton variant="secondary" size="lg" className="w-40" onClick={stopwatch.pause}>
            <Pause className="mr-2 w-5 h-5 fill-current" /> Pause
          </MotionButton>
        ) : (
          <MotionButton variant="primary" size="lg" className="w-40" onClick={stopwatch.start}>
            <Play className="mr-2 w-5 h-5 fill-current" /> {stopwatch.elapsed > 0 ? 'Resume' : 'Start'}
          </MotionButton>
        )}
        
        <MotionButton 
          variant="ghost" 
          size="icon" 
          onClick={stopwatch.addLap} 
          disabled={!stopwatch.isRunning}
          title="Lap"
        >
           <Flag className="w-6 h-6" />
        </MotionButton>
      </div>

      {/* Laps Table */}
      {stopwatch.laps.length > 0 && (
        <div className="w-full mt-8 px-4">
            <div className="grid grid-cols-3 gap-4 py-2 border-b-2 border-foreground font-mono font-bold text-xs uppercase tracking-wider opacity-70">
                <span>Lap</span>
                <span className="text-center">Split</span>
                <span className="text-right">Total</span>
            </div>
            <div className="flex flex-col-reverse max-h-64 overflow-y-auto scrollbar-thin">
              <AnimatePresence initial={false}>
                 {stopwatch.laps.map((lapTime, index) => {
                    const prevLapTime = index > 0 ? stopwatch.laps[index - 1] : 0;
                    const split = lapTime - prevLapTime;
                    return (
                        <motion.div 
                           key={index}
                           initial={{ opacity: 0, y: -10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="grid grid-cols-3 gap-4 py-3 border-b border-foreground/5 font-mono text-sm"
                        >
                            <span className="font-bold text-foreground/70">#{index + 1}</span>
                            <span className="text-center">{formatTime(split)}</span>
                            <span className="text-right opacity-70">{formatTime(lapTime)}</span>
                        </motion.div>
                    );
                 })}
              </AnimatePresence>
            </div>
        </div>
      )}
    </div>
  );
}
