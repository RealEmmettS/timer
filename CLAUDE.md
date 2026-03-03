# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (v9 flat config)
```

No test framework is configured.

## Architecture

Next.js 16 App Router single-page timer app with three modes: Countdown, Stopwatch, and Interval (HIIT). Bauhaus-inspired design using primary colors (red, blue, yellow) and geometric shapes.

### Timing Engine

Timing runs off the main thread via a Web Worker (`public/timer.worker.js`) that sends `TICK` messages every ~50ms. The `useTimerEngine` hook (`src/hooks/useTimerEngine.ts`) consumes these ticks and applies drift correction against system time. Each timer mode gets its own independent engine instance, managed by `TimerContext` (`src/context/TimerContext.tsx`).

### Component Structure

- **`src/components/modes/`** — Mode-specific views: `CountdownView`, `StopwatchView`, `IntervalView`
- **`src/components/shared/`** — Reusable atoms: `MotionButton` (variants: primary, secondary, danger, ghost), `ModeSwitcher`
- **`src/components/TimerDisplay/`** — Compound component: `index.tsx` orchestrates `Digit` (animated individual digits) and `ProgressRing` (SVG circular progress)
- **`src/components/InteractiveGridBackground.tsx`** — Canvas-based grid that highlights cells under cursor

### Styling & Design Tokens

Tailwind CSS v4 with design tokens as CSS custom properties in `src/app/globals.css`. Key variables: `--bauhaus-red`, `--bauhaus-blue`, `--bauhaus-yellow`, `--bauhaus-dark`, `--bauhaus-light`. Dark mode via both `prefers-color-scheme` media query and `.dark` class. Utility classes: `.bauhaus-shadow`, `.bauhaus-shadow-sm`, `.bauhaus-border`.

### Typography

Local "ID Clarwe Mono" font loaded via `next/font/local` in `layout.tsx`, exposed as `--font-clarwe-mono` and applied to both sans and mono font families. Assets in `ID Clarwe Mono Web/`. The `Ezra/` directory is archived and unused.

### Audio

Web Audio API oscillators in `src/utils/audio.ts` — `playBeep()`, `playTick()`, `playComplete()` (four-note ascending chime). No audio files; all sounds are synthesized.

### Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

## Conventions

- All interactive components use `'use client'` directive
- Framer Motion for all animations and transitions; `AnimatePresence` for mode switching
- Accessibility: `prefers-reduced-motion` disables animations; safe-area insets for notched devices
- Mobile-first responsive design using Tailwind breakpoints and `clamp()` for fluid sizing
