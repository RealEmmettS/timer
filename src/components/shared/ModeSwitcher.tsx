'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';

type Mode = 'countdown' | 'stopwatch' | 'interval';

interface ModeSwitcherProps {
  activeMode: Mode;
  onChange: (mode: Mode) => void;
}

export function ModeSwitcher({ activeMode, onChange }: ModeSwitcherProps) {
  const modes: { id: Mode; label: string }[] = [
    { id: 'countdown', label: 'Countdown' },
    { id: 'stopwatch', label: 'Stopwatch' },
    { id: 'interval', label: 'Interval' },
  ];

  return (
    <div className="flex p-1 space-x-1 bg-white border-2 border-foreground bauhaus-shadow dark:bg-neutral-900 rounded-none">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onChange(mode.id)}
          className={clsx(
            "relative px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors z-10 outline-none focus-visible:ring-2",
            activeMode === mode.id ? "text-white dark:text-black" : "text-foreground hover:text-foreground/70"
          )}
          style={{
             WebkitTapHighlightColor: "transparent",
          }}
        >
          {activeMode === mode.id && (
            <motion.div
              layoutId="activeModeTab"
              className="absolute inset-0 bg-foreground dark:bg-white -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          {mode.label}
        </button>
      ))}
    </div>
  );
}

