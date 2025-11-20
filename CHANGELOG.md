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

## [2025-11-20]

### Changed
- Swapped global typography to the local ID Clarwe Mono font (via `next/font/local`, woff2/woff) and now apply it to both sans and mono slots for consistent UI text.

### Fixed
- Cleared ESLint issues (dark-mode preference sync without in-effect state, TimerContext reset immutability, typed AudioContext fallback, unused imports) to keep CI clean.
