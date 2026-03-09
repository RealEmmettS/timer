# Changelog

All notable changes to the "SHAUGHV Timer" project will be documented in this file.

## [2026-03-09]

### Fixed
- **Dark/Light Mode Toggle**: Toggle button had no visible effect — removed conflicting `@media (prefers-color-scheme: dark)` CSS rule that overrode the class-based `.dark` toggle. The JS already syncs with system preference on mount, making the media query redundant and preventing manual switching.

## [2026-03-03]

### Changed
- **Favicon**: Switched to SHAUGHV Dark Alternate brandmark (orange/terracotta accents on dark background) from the previous dark green variant.
- **Favicon**: Replaced default `favicon.ico` with dark SHAUGHV brandmark SVG (`icon.svg`) for crisp, scalable browser tab icon.

### Added
- **SHAUGHV Branding**: Replaced "Bauhaus Timer" branding with official SHAUGHV SVG wordmark in header, updated metadata title/description, and updated footer text.
- **Mobile Haptic Feedback**: Integrated `web-haptics` library with preset haptic functions (selection, light, medium, soft, rigid, warning, success, nudge) for tactile feedback on supported mobile devices.
- **MotionButton Auto-Haptics**: All `MotionButton` instances fire variant-appropriate haptic feedback by default (primary→medium, secondary→light, danger→warning, ghost→selection), with per-button override via `haptic` prop.
- **ModeSwitcher Haptics**: Tab switches trigger selection haptic feedback.
- **Timer Event Haptics**: Countdown completion fires success haptic; stopwatch lap fires rigid haptic; interval phase transitions fire nudge haptic; workout completion fires success haptic.
- **Interval Completion Audio**: Added `playComplete()` audio chime when interval workout finishes (previously missing).

### Fixed
- **Stopwatch Digit Clipping**: Centisecond digits (`.XX`) were visually cut off during rapid updates because the spring animation (stiffness 400, damping 25) couldn't settle within the ~50ms tick interval. Added a `fast` rendering path to the `Digit` component that swaps digits instantly without animation, applied to the two centisecond digit slots.
- **Digit Container Width**: Changed all `Digit` containers from `w-[0.65em]` to `w-[1ch]` — the CSS `ch` unit equals the width of the "0" glyph in the current font, which is semantically correct for a single-digit display and prevents clipping regardless of font metrics.
- **Countdown Duration Input Transparency**: The duration input field on the Countdown view used `bg-transparent`, allowing the interactive grid background to show through the text box. Changed to `bg-background` so the input has a solid, opaque fill matching the app's theme in both light and dark modes.

### Changed
- **Global Tabular Numerals**: Added `font-variant-numeric: tabular-nums` to the `body` rule in `globals.css`. This enables the OpenType `tnum` feature globally, ensuring all numeric characters render at equal widths across the entire app — preventing horizontal layout shift whenever digits change (timers, counters, lap times, adjustment buttons, etc.).
- **Stopwatch Laps Table**: Added the `tabular-nums` Tailwind utility class to lap table rows in `StopwatchView`, ensuring split and total time columns maintain consistent alignment as values update.

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
