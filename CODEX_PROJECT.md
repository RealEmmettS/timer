# CODEX_PROJECT

## TL;DR
- Next.js 16 Bauhaus Timer with countdown, stopwatch, and interval modes powered by a Web Worker timing engine.
- ID Clarwe Mono now drives UI typography (local assets in `ID Clarwe Mono Web/`), replacing the earlier Ezra setup.
- Tailwind CSS v4 drives styling; Framer Motion powers interactive motion.

## Project Summary
The Bauhaus Timer is a high-fidelity timer application with three modes (Countdown, Stopwatch, Interval) and a Bauhaus-inspired aesthetic. The timing logic runs in a Web Worker (`public/timer.worker.js`) with drift correction, while global state lives in `TimerContext` + `useTimerEngine`. UI components live under `src/components`, with shared atoms/molecules (e.g., `MotionButton`) and mode-specific views. Global styling and design tokens are defined in `src/app/globals.css`, and Next.js App Router files live under `src/app/`.

### Current Goals
- Maintain the Bauhaus look/feel while ensuring high-accuracy timing and smooth motion.
- Keep typography consistent with the local ID Clarwe Mono family across themes.
- Preserve Web Worker timing accuracy and clean state management across modes.

### How to Run
- Install deps: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`

## Filetree (root, excluding `node_modules` / `.next`)
```
.
├── CHANGELOG.md
├── CODEX_PROJECT.md
├── Ezra/
├── ID Clarwe Mono Web/
├── README.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public/
│   ├── timer.worker.js
│   └── *.svg
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── InteractiveGridBackground.tsx
│   │   ├── modes/
│   │   ├── shared/
│   │   └── TimerDisplay/
│   ├── context/TimerContext.tsx
│   ├── hooks/useTimerEngine.ts
│   └── utils/audio.ts
├── timer_web_app_full_spec.md
└── tsconfig.json
```

## Notes
- ID Clarwe Mono assets live at `ID Clarwe Mono Web/` (local woff2/woff). Font variable exposed via `--font-clarwe-mono` from `src/app/layout.tsx` and applied to both sans and mono slots.
- Ezra archive remains in `Ezra/` but is no longer the active UI font.
- Tailwind CSS v4 inline theming uses CSS variables defined in `src/app/globals.css`.
- ESLint currently passes (`npm run lint`).
