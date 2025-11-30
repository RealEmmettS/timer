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
/Volumes/X9 Pro/code/timer
├── CHANGELOG.md
├── CODEX_PROJECT.md
├── eslint.config.mjs
├── Ezra
│   ├── demo.html
│   ├── Ezra-Black.svg
│   ├── Ezra-Black.woff
│   ├── Ezra-Black.woff2
│   ├── Ezra-BlackItalic.svg
│   ├── Ezra-BlackItalic.woff
│   ├── Ezra-BlackItalic.woff2
│   ├── Ezra-Bold.svg
│   ├── Ezra-Bold.woff
│   ├── Ezra-Bold.woff2
│   ├── Ezra-BoldItalic.svg
│   ├── Ezra-BoldItalic.woff
│   ├── Ezra-BoldItalic.woff2
│   ├── Ezra-ExtraBold.svg
│   ├── Ezra-ExtraBold.woff
│   ├── Ezra-ExtraBold.woff2
│   ├── Ezra-ExtraBoldItalic.svg
│   ├── Ezra-ExtraBoldItalic.woff
│   ├── Ezra-ExtraBoldItalic.woff2
│   ├── Ezra-Italic.svg
│   ├── Ezra-Italic.woff
│   ├── Ezra-Italic.woff2
│   ├── Ezra-Light.svg
│   ├── Ezra-Light.woff
│   ├── Ezra-Light.woff2
│   ├── Ezra-LightItalic.svg
│   ├── Ezra-LightItalic.woff
│   ├── Ezra-LightItalic.woff2
│   ├── Ezra-Medium.svg
│   ├── Ezra-Medium.woff
│   ├── Ezra-Medium.woff2
│   ├── Ezra-MediumItalic.svg
│   ├── Ezra-MediumItalic.woff
│   ├── Ezra-MediumItalic.woff2
│   ├── Ezra-Regular.svg
│   ├── Ezra-Regular.woff
│   ├── Ezra-Regular.woff2
│   ├── Ezra-SemiBold.svg
│   ├── Ezra-SemiBold.woff
│   ├── Ezra-SemiBold.woff2
│   ├── Ezra-SemiBoldItalic.svg
│   ├── Ezra-SemiBoldItalic.woff
│   ├── Ezra-SemiBoldItalic.woff2
│   └── stylesheet.css
├── ID Clarwe Mono Web
│   ├── demo.html
│   ├── IDClarweMono-Regular.svg
│   ├── IDClarweMono-Regular.woff
│   ├── IDClarweMono-Regular.woff2
│   └── stylesheet.css
├── interactive-grid-docs.md
├── interactive-grid-layout-guide.md
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── timer.worker.js
│   ├── vercel.svg
│   └── window.svg
├── README.md
├── src
│   ├── app
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── InteractiveGridBackground.tsx
│   │   ├── modes
│   │   ├── shared
│   │   └── TimerDisplay
│   ├── context
│   │   └── TimerContext.tsx
│   ├── hooks
│   │   └── useTimerEngine.ts
│   └── utils
│       └── audio.ts
├── timer_web_app_full_spec.md
├── tsconfig.json
└── tsconfig.tsbuildinfo
```

## Notes
- ID Clarwe Mono assets live at `ID Clarwe Mono Web/` (local woff2/woff). Font variable exposed via `--font-clarwe-mono` from `src/app/layout.tsx` and applied to both sans and mono slots.
- Ezra archive remains in `Ezra/` but is no longer the active UI font.
- Tailwind CSS v4 inline theming uses CSS variables defined in `src/app/globals.css`.
- ESLint currently passes (`npm run lint`).

## Recent Accessibility & Responsive Updates (2025-11-29)
- **Accessibility**: Added `prefers-reduced-motion` CSS support in `globals.css` to respect user motion preferences
- **Mobile Support**: Added safe-area insets for notched devices (iPhone X+, etc.)
- **Dark Mode**: Fixed dark mode toggle to work with both `prefers-color-scheme` media query and `.dark` class-based switching
- **Responsive Design**:
  - ModeSwitcher uses responsive padding (`px-2 sm:px-4`, `text-xs sm:text-sm`) for screens < 320px
  - All components now use `bg-background` CSS variable for proper theme support
- **Countdown Mode**: Replaced preset buttons with flexible duration input field and quick adjustment buttons (+1m, -1m, +5m)
