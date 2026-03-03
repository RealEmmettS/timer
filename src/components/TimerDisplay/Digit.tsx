'use client';

import { motion, AnimatePresence } from 'framer-motion';

export function Digit({ value, fast }: { value: string; fast?: boolean }) {
  // If value is non-numeric (like : or .), don't animate the slide, just render
  if (!/[0-9]/.test(value)) {
    return <span className="inline-block">{value}</span>;
  }

  // Fast-changing digits (e.g. centiseconds) skip animation to avoid clipping
  if (fast) {
    return (
      <div className="relative w-[1ch] h-[1em] inline-flex justify-center tabular-nums">
        <span className="absolute inset-0 flex items-center justify-center">
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-[1ch] h-[1em] overflow-hidden inline-flex justify-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

