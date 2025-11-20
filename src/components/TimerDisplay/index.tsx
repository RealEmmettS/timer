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

  // Calculate dynamic size based on viewport or parent container
  // We'll use a base size that scales, plus padding
  // A simple approach is to ensure the ring is always X% larger than the text width
  // But typically for a timer, we want a consistent large size that fits the container.
  // Let's scale the ring based on the text size with generous padding.
  
  // Base size on text width + padding
  // If text width is 300px, ring might be 400px.
  // We need a minimum size though.
  
  // Actually, let's use a large responsive unit for the ring and center the text within it.
  // The user asked for increased spacing and responsiveness.
  
  // Let's make the ring size relative to the text content but ensuring a minimum gap.
  // We can use a constant padding factor.
  
  // Default large size
  const baseSize = 340; 
  // If text is very wide (e.g. hours + ms), we might need more space? 
  // Usually the font size shrinks responsively, so the ring can stay fixed relative to container width?
  // The user request: "when timer text changes, the circle space changes accordingly" implies the circle grows/shrinks or fits the text.
  
  // Let's use a container query or just fit-content logic? 
  // SVG needs explicit pixel size for stroke calculations usually, or viewbox.
  
  // Better approach: 
  // 1. Render text.
  // 2. Calculate text width (approximate or measured).
  // 3. Set ring diameter = textWidth * 1.5 (generous spacing).
  
  // We will stick to a responsive container approach where the ring defines the constraint 
  // and the text fits inside with padding. 
  // OR: The ring wraps the text.
  
  // Let's try wrapping the text with the ring based on the `textSize` state if available, otherwise default.
  const ringPadding = 60; // Space between text and ring
  const minRingSize = 320;
  
  // Approximate width based on character count if measurement lags (SSR/initial)
  // 00:00 = 5 chars. 00:00:00 = 8 chars.
  const charCount = (hasHours ? 3 : 0) + 5 + (hasMs ? 3 : 0);
  const approxWidth = charCount * 35; // Rough guess for 5xl/6xl font
  
  // Use measured width if available, else approximation
  const targetSize = Math.max(minRingSize, (textSize.width || approxWidth) + ringPadding * 2);
  
  // Smooth out size changes?
  // For now, just pass direct size.

  return (
    <div className="relative flex flex-col items-center justify-center py-12 w-full max-w-xl mx-auto">
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
