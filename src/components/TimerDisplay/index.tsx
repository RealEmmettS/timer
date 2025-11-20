'use client';

import { Digit } from './Digit';
import { ProgressRing } from './ProgressRing';
import { clsx } from 'clsx';
import { useState, useRef, useEffect } from 'react';

interface TimerDisplayProps {
  ms: number;
  totalMs?: number; // For progress ring
  mode?: 'countdown' | 'stopwatch' | 'interval';
  showMs?: boolean;
  overtime?: boolean;
  ringColor?: string;
}

export function TimerDisplay({ ms, totalMs = 0, mode = 'countdown', showMs = false, overtime = false, ringColor: propRingColor }: TimerDisplayProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [textSize, setTextSize] = useState({ width: 0, height: 0 });

  // Format logic
  const absMs = Math.abs(ms);
  const hours = Math.floor(absMs / 3600000);
  const minutes = Math.floor((absMs % 3600000) / 60000);
  const seconds = Math.floor((absMs % 60000) / 1000);
  const centiseconds = Math.floor((absMs % 1000) / 10);

  const pad = (n: number) => n.toString().padStart(2, '0');
  
  // Calculate progress for ring
  let progress = 0;
  if (mode === 'countdown' && totalMs > 0) {
     progress = Math.max(0, ms) / totalMs;
  } else if (mode === 'interval' && totalMs > 0) {
     // Interval usually shows remaining time in current segment
     progress = Math.max(0, ms) / totalMs;
  } else if (mode === 'stopwatch') {
     // Stopwatch fills up per minute
     progress = (absMs % 60000) / 60000; 
  }
  
  // Determine ring color
  let ringColor = propRingColor;
  if (!ringColor) {
      ringColor = "var(--bauhaus-blue)";
      if (overtime) ringColor = "var(--bauhaus-red)";
      else if (mode === 'interval') ringColor = "var(--bauhaus-yellow)"; // Or pass from parent based on Work/Rest
      else if (mode === 'countdown' && ms <= 10000 && ms > 0) ringColor = "var(--bauhaus-yellow)";
  }

  // Determine text length category for sizing
  const hasHours = hours > 0;
  const hasMs = showMs;

  // Measure text size for responsive ring
  useEffect(() => {
    if (textRef.current) {
        const { width, height } = textRef.current.getBoundingClientRect();
        setTextSize({ width, height });
    }
  }, [hasHours, hasMs]); // Recalculate when layout might change significantly

  const ringPadding = 60; // Space between text and ring
  const minRingSize = 320;
  
  // Approximate width based on character count if measurement lags (SSR/initial)
  // 00:00 = 5 chars. 00:00:00 = 8 chars.
  const charCount = (hasHours ? 3 : 0) + 5 + (hasMs ? 3 : 0);
  const approxWidth = charCount * 35; // Rough guess for 5xl/6xl font
  
  // Use measured width if available, else approximation
  const targetSize = Math.max(minRingSize, (textSize.width || approxWidth) + ringPadding * 2);
  
  return (
    <div 
        className="relative flex flex-col items-center justify-center w-full max-w-xl mx-auto transition-all duration-300 ease-out"
        style={{ minHeight: targetSize + 40, marginTop: '2rem', marginBottom: '2rem' }} 
    >
      {/* Ring Container - Absolute centered but sized to content */}
      <div 
        className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out"
      >
        <ProgressRing 
            progress={progress} 
            size={targetSize} 
            strokeWidth={12} 
            color={ringColor} 
        />
      </div>
      
      <div 
        ref={textRef}
        className={clsx(
        "z-10 font-mono font-bold tabular-nums flex items-baseline justify-center leading-none select-none relative",
        overtime ? "text-bauhaus-red" : "text-foreground",
        // Adjust font size based on complexity to keep it fitting well
        hasHours ? "text-5xl md:text-6xl" : (showMs ? "text-6xl md:text-7xl" : "text-7xl md:text-8xl")
      )}>
        {overtime && <span className="mr-2 text-4xl self-center">+</span>}
        
        {hasHours && (
            <>
                <Digit value={pad(hours)[0]} />
                <Digit value={pad(hours)[1]} />
                <span className="mx-0.5 opacity-50">:</span>
            </>
        )}
        
        <Digit value={pad(minutes)[0]} />
        <Digit value={pad(minutes)[1]} />
        
        <span className="mx-0.5 opacity-50">:</span>
        
        <Digit value={pad(seconds)[0]} />
        <Digit value={pad(seconds)[1]} />
        
        {showMs && (
          <>
            <span className="mx-1 text-4xl opacity-50 self-end mb-2">.</span>
            <div className="text-4xl opacity-80 flex self-end mb-2">
               <Digit value={pad(centiseconds)[0]} />
               <Digit value={pad(centiseconds)[1]} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
