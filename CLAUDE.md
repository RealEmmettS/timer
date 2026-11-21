# SHAUGHV Timer

Run `npm run dev` for development, `npm run lint` for ESLint, and `npm run build` for the production build and TypeScript check. No test framework is configured.

The Next.js App Router page owns mode selection, sound, and theme controls. All three mode components stay mounted so their timers and alerts survive switching modes. Only the active mode renders its interface.

`src/hooks/useTimerEngine.ts` tracks the elapsed time against an absolute timestamp. The worker in `public/timer.worker.js` schedules display updates. Keep the fast refresh local to the visible stopwatch. Record laps and pauses from the clock instead of the most recent paint.

`src/components/TimerDisplay/index.tsx` contains the digital readout, calibrated dial, keyboard shortcut, and shared actions. `src/app/globals.css` defines the palette, layout, motion, and reduced-motion behavior. The pointer grid has its own layer behind opaque controls.

Load the live Makira and Geist Mono family stylesheets from the SHAUGHV CDN in `src/app/layout.tsx`. The CDN also supplies the shared cursor and footer identity. The original font directories are archived assets.

Use Lucide for controls, keep labels accessible, and preserve fractional countdown minutes, zero-rest intervals, lap splits, haptics, and independent timer state across views.
