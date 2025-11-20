'use client';

import { motion } from 'framer-motion';

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function ProgressRing({ progress, size = 300, strokeWidth = 12, color = "var(--bauhaus-red)" }: ProgressRingProps) {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - clampedProgress * circumference;

  return (
    <div className="relative flex items-center justify-center pointer-events-none">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          stroke="var(--foreground)"
          strokeOpacity="0.1"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Active Ring */}
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ strokeDasharray: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ 
            // Use shorter duration for smooth updates if progress changes frequently
            duration: 0.1, 
            ease: "linear" 
          }}
        />
      </svg>
    </div>
  );
}

