# Changelog

All notable changes to the "Bauhaus Timer" project will be documented in this file.

## [Unreleased]

### Added
- **Core Architecture**:
    - Initialized Next.js 15+ project with TypeScript and Tailwind CSS.
    - Implemented `timer.worker.js` Web Worker for high-precision, background-safe timing.
    - Created `TimerContext` and `useTimerEngine` hook for global state management.
- **UI / UX**:
    - Developed Bauhaus-inspired design system (Red/Blue/Yellow accents, geometric shapes).
    - Added `InteractiveGridBackground` responding to mouse hover.
    - Implemented Dark/Light mode toggling.
    - Added `MotionButton` with tactile tap animations.
- **Timer Modes**:
    - **Countdown**:
        - Circular progress ring with `stroke-dashoffset` animation.
        - Presets (1m, 5m, 10m, etc.) and manual time adjustment (+/- buttons).
        - Overtime support: timer counts up in red after reaching 0.
    - **Stopwatch**:
        - Millisecond display support.
        - Lap recording system with split time calculation.
        - Animated lap table.
    - **Interval**:
        - Configurable Work/Rest periods and number of Rounds.
        - Distinct visual phases (Yellow for Work, Blue for Rest).
        - Setup screen for configuring parameters.
- **Audio**:
    - Added Web Audio API integration for completion beeps.

### Fixed
- N/A (Initial Release)

## [2025-11-29]

### Added
- **Accessibility**: Added `prefers-reduced-motion` CSS support for users with vestibular disorders
- **Accessibility**: Added safe-area insets for notched devices (iPhone X+, etc.)

### Changed
- **ModeSwitcher**: Improved responsive padding (`px-2 sm:px-4`, `text-xs sm:text-sm`) for better display on screens < 320px
- **ModeSwitcher**: Updated background to use `bg-background` CSS variable for proper dark mode support
- **MotionButton**: Updated secondary variant to use `bg-background` for consistent dark mode theming
- **IntervalView**: Changed setup form background to translucent (`bg-background/90 backdrop-blur-sm`) for visual consistency with other views
- **CountdownView**: Refactored duration input state management to compute display value during render instead of using `setState` in effect (ESLint compliance)

### Fixed
- **Dark Mode Toggle**: Fixed dark mode not applying when manually toggled - CSS variables now respond to `.dark` class in addition to `prefers-color-scheme` media query
- **Theme Consistency**: All components now properly support both light and dark modes using CSS variables
- **Contrast Accessibility**: Improved text contrast for labels and secondary text in both light and dark modes (changed from `opacity-50` to `text-foreground/70`)
- **ModeSwitcher**: Fixed selected tab text color in dark mode - now uses `text-background` CSS variable instead of Tailwind `dark:` variants for proper contrast (white bg with black text)

### Removed
- Removed unnecessary `z-20` declarations from control containers in CountdownView, StopwatchView, and IntervalView (z-index not needed due to canvas-based grid implementation)

## [2025-11-20]

### Changed
- Swapped global typography to the local ID Clarwe Mono font (via `next/font/local`, woff2/woff) and now apply it to both sans and mono slots for consistent UI text.

### Fixed
- Cleared ESLint issues (dark-mode preference sync without in-effect state, TimerContext reset immutability, typed AudioContext fallback, unused imports) to keep CI clean.
