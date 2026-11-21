# SHAUGHV Timer

The Next.js App Router timer has three independent modes. See `README.md` for the user-facing behavior and commands, and `CLAUDE.md` for the timing architecture and design conventions.

## Source map

- `src/app/` contains the shell, hosted font stylesheets, shared brand assets, color themes, and responsive instrument styles.
- `src/components/modes/` owns the individual timer states, alarms, settings, and laps.
- `src/components/TimerDisplay/` renders the readout, dial, progress, and timing controls.
- `src/components/InteractiveGridBackground.tsx` handles pointer feedback in the background margins.
- `src/hooks/useTimerEngine.ts` and `public/timer.worker.js` handle timestamp-based timing and display updates.
- `src/utils/` contains audio and haptics.

The original Ezra and ID Clarwe Mono font assets and the grid design guides document earlier versions. Runtime typography comes from the hosted SHAUGHV CDN family stylesheets.
