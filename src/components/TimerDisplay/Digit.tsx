'use client';

import { motion, AnimatePresence } from 'framer-motion';

export function Digit({ value }: { value: string }) {
  // If value is non-numeric (like : or .), don't animate the slide, just render
  if (!/[0-9]/.test(value)) {
    return <span className="inline-block">{value}</span>;
  }

  return (
    <div className="relative w-[0.65em] h-[1em] overflow-hidden inline-flex justify-center">
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

