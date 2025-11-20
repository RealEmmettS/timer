# Timer Web App – Full Engineering & UX Specification

## 1. Core Concept

A sleek, session-based timer application that functions as:

- **Countdown Timer**
- **Stopwatch**
- **Interval / Session Timer** (e.g., Pomodoro, HIIT, custom sequences)

No authentication is required. All behavior is:

- **Session-based** for active, in-flight timers (fast recovery if tab reloads).
- **Persisted locally** via `localStorage` for presets, history, and global preferences.

The goal is a professional-grade, native-feeling web timer that users keep pinned and rely on for precise timing, with rich visual feedback and fluid interactions.

---

## 2. Architecture Overview

**Tech Stack** (target):

- **Next.js 14+** with App Router
- **React** (Client Components for timer logic)
- **Framer Motion** for animation & layout transitions
- **Tailwind CSS** for styling & design system
- **Web Audio API** for sound & alerts
- **Browser Storage**:
  - `sessionStorage` for active timer runtime state
  - `localStorage` for presets, history, preferences
- **Optional**: Web Workers for high-accuracy timing in background

### 2.1 High-Level Application Structure

- **Routes** (App Router):
  - `/` – Main app (all modes, tabbed UI)
  - `/settings` – Preferences & configuration
  - `/about` – Product info, privacy, keyboard shortcuts
  - `/fullscreen` – Dedicated full-screen display (minimal UI)

- **Core Context / Store**:
  - A `TimerProvider` (Context or Zustand-like store) that manages:
    - All timers (countdown, stopwatch, intervals)
    - Global settings
    - Active mode and active timer
  - Responsible for serialization to and from `localStorage` / `sessionStorage`.

---

## 3. Mode System

Three primary modes, unified by a shared presentation pattern (big main timer + contextual controls) but with distinct logic.

### 3.1 Countdown Timer Mode

**Use cases:** Focus sessions, cooking, reminders, short tasks.

#### 3.1.1 Features

- **Quick Preset Buttons:**
  - `1 min`, `5 min`, `10 min`, `15 min`, `25 min (Pomodoro)`, `Custom…`
  - Presets are configurable and stored in `localStorage`.

- **Manual Time Input with Smart Parsing:**
  - Accepts flexible input formats:
    - `"5:30"` → 5 minutes 30 seconds
    - `"330"` → 3 minutes 30 seconds
    - `"5m30s"`, `"1h 10m"`, etc.
  - Input handled via a dedicated field or command palette-style quick entry.

- **Progressive Time Wheels:**
  - Optional wheel-picker for **hours / minutes / seconds**:
    - Scroll or drag to adjust values.
    - Smooth Framer Motion transitions when values change.

- **Visual Progress Ring:**
  - A circular ring that **depletes clockwise** as the timer counts down.
  - When the timer enters overtime (below zero), the ring switches style (e.g., inner ring grows or color inverts).

- **Overtime Tracking:**
  - After reaching `00:00`, the timer can continue counting **up** in overtime mode.
  - Visual distinction:
    - Time text color changes (e.g., white → red).
    - `+00:03` style prefix to indicate overtime.

- **Overtime Control Options:**
  - Toggle to **stop at zero** or **auto-continue into overtime** (configurable per timer or globally).

### 3.2 Stopwatch Mode

**Use cases:** Time tracking, workouts, testing, speedruns.

#### 3.2.1 Features

- **Precision Timing:**
  - Internally track to **milliseconds**.
  - Display to **centiseconds** (`HH:MM:SS.cc`), with the option to hide decimals.

- **Lap / Split Functionality:**
  - Unlimited lap count, stored in-memory + persisted for the active session.
  - Each lap row:
    - `Lap #`
    - Lap duration (time since last lap)
    - Total elapsed time at that lap

- **Segment Comparison:**
  - Show delta between current lap and previous lap:
    - `+0.42` / `-0.18` style next to each lap row.
  - Highlight **fastest** and **slowest** laps with subtle color coding.

- **Running Pace Calculator:**
  - Optional: user can set a **distance** (e.g., `5 km`, `400 m`).
  - App computes **pace per lap** or average pace.

- **Visual Timeline of Laps:**
  - Mini bar graph or timeline below the lap table.
  - Bar length proportional to lap duration.
  - Animated entry on each new lap (slide-up + fade-in).

### 3.3 Interval Timer Mode

**Use cases:** HIIT, Tabata, Pomodoro, study/break cycles, complex workflows.

#### 3.3.1 Features

- **Work/Rest Interval Configuration:**
  - Define **Work** duration and **Rest** duration.
  - Color coding: Work (e.g., green/orange), Rest (blue), Preparation (purple).

- **Round Counter:**
  - Set number of rounds (e.g., 8 rounds for Tabata).
  - Display current round vs total (`Round 3 / 8`).

- **Preparation Time:**
  - Optional pre-start countdown (e.g., `10s` "Get ready").
  - Displayed with distinct styling (purple or neutral color, label `Prepare`).

- **Auto-Progression:**
  - Automatically transitions between Work → Rest → next Round.
  - Configurable behavior at the end:
    - Stop on completion.
    - Auto-loop full cycle.

- **Presets:**
  - Built-in: HIIT, Tabata, Pomodoro variants.
  - Custom interval sequences saved as named presets.

- **Sequence Editor (Advanced):**
  - Add multiple segments beyond simple Work/Rest:
    - Each segment: label, duration, type/color.
  - Drag-and-drop reordering.
  - Multi-cycle configuration (e.g., repeat the whole sequence `N` times).

---

## 4. User Interface Design

### 4.1 Layout Structure

**Main Layout (Desktop & Tablet):**

- **Header:**
  - App name or logo (minimal).
  - **Mode switcher** (segmented control: `Timer | Stopwatch | Intervals`).
  - Settings icon (gear) on the right.

- **Main Content:**
  - **Primary Timer Display** centered:
    - Large, responsive time text.
    - Circular progress representation.
    - Mode indicator / label.
  - Below the main display:
    - Contextual controls (Start, Pause, Reset, Lap, etc.).
    - Secondary information (current round, upcoming segment, lap summary).

- **Supporting Panels:**
  - Stopwatch: Lap table, pace stats, timeline.
  - Countdown: Presets row, timer list for multi-timers.
  - Intervals: Sequence editor, preset list.

- **Footer:**
  - Shortcut hint (e.g., `Press ? for keyboard shortcuts`).
  - Minimal status or attribution.

**Mobile Layout:**

- Time display dominates the upper half.
- Controls are large and touch-friendly below.
- Mode switcher converted to a top tab-bar.
- Secondary info (laps, history) is scrollable beneath the fold.

### 4.2 Main Timer Display

- **Dynamic font sizing** using viewport width and container size.
- **Monospace font** for consistent digit width.
- **Subtle Framer Motion transitions** when digits change:
  - Vertical slide or crossfade, but gentle enough to avoid distraction.

- **Circular Visualization:**
  - Countdown: ring depletes clockwise.
  - Stopwatch: ring fills clockwise or cycles per minute.
  - Interval: ring/color encodes current phase (Work/Rest/Prep).

- **Mode Indicator:**
  - Small pill label (e.g., `COUNTDOWN`, `STOPWATCH`, `INTERVALS`).
  - Morph animation on mode change (color + label text).

### 4.3 Control Elements

- **Primary Action Button (Start/Pause/Resume):**
  - Large, prominent center or bottom-center.
  - Uses a "breathing" animation when running (subtle scale/pulse).

- **Secondary Actions:**
  - Countdown: `Reset`, `+1m`, `+5m`, `-10s`, `Edit time`.
  - Stopwatch: `Lap`, `Reset`.
  - Intervals: `Reset`, `Skip segment`, `Skip round`.

- **Mode Switcher:**
  - Segmented control with Framer Motion sliding indicator.
  - Keyboard focus styling.

- **Settings Gear:**
  - Opens a modal or separate `/settings` page.

---

## 5. Visual Design System

### 5.1 Color Schemes

- **Theme Modes:**
  - Light
  - Dark
  - Auto (system preference)

- **Accent Color Customization:**
  - User-selectable accent (e.g., green, blue, orange, pink, etc.).
  - Accent affects:
    - Primary action button
    - Progress rings
    - Highlights / sliders

- **State-Based Colors:**
  - **Running:** Green spectrum.
  - **Warning:** Yellow/amber (last `N` seconds, configurable).
  - **Overtime / Critical:** Red.
  - **Rest (Intervals):** Blue.
  - **Preparation:** Purple.

### 5.2 Typography

- **Timer Digits:**
  - Monospace font, large weight.
  - Weight or glow can increase as time runs out (last 10 seconds).

- **Labels & Meta Text:**
  - Clean sans-serif.
  - Smaller size, high contrast for readability.

- **Animations:**
  - Number morphing (Framer Motion): minimal vertical slide or fade.
  - Avoid excessive motion for accessibility; respect "Reduced Motion" settings.

---

## 6. Interactive Features

### 6.1 Keyboard & Gesture Controls

- **Keyboard Shortcuts (Desktop):**
  - `Space` – Start/Pause active timer.
  - `R` – Reset active timer.
  - `L` – Lap (in Stopwatch mode).
  - `Tab` – Cycle through modes.
  - `1` / `2` / `3` – Jump to specific mode.
  - `↑ / ↓` – Adjust time (countdown) in small increments.
  - `Esc` – Stop / Reset or close dialogs.
  - `?` – Show keyboard shortcut overlay.

- **Gestures (Mobile / Touch):**
  - Swipe left/right: switch modes.
  - Tap/hold on time segments: edit value.
  - Long-press primary button: quick access to reset.

### 6.2 Animation Language (Framer Motion)

- **Micro-Interactions:**
  - Button press: slight scale down + spring back with mild overshoot.
  - Timer tick: very subtle pulse or shadow change on second boundaries.
  - Lap added: lap row slides in from bottom + fades in.

- **State Transitions:**
  - Countdown start: ring animates from full to current progress smoothly.
  - Pause: motion of the ring eases to a halt, slight blur/fade effect.
  - Reset: reverse-unwind animation back to initial state.
  - Mode change: crossfade of main content using `AnimatePresence` + shared layout transitions.

- **Completion Effects:**
  - Ring "explosion" or particle burst.
  - Confetti for special milestones (e.g., 100 completed timers, 10th Pomodoro).
  - Respect "Reduced Motion" setting and provide a non-animated option.

---

## 7. Advanced Features

### 7.1 Sound Design (Web Audio API)

- **Sound Types:**
  - Tick sounds (optional; off by default).
  - Warning beeps (e.g., last 5 seconds).
  - Completion sounds (multiple choices / styles).
  - Interval transitions: distinct Work → Rest sound.

- **Controls:**
  - Global sound enable/disable.
  - Volume slider.
  - Per-mode overrides optional.
  - "Test sound" button.

- **Custom Sound Upload:**
  - Allow user to upload short audio clips.
  - Store references in `localStorage` (or as Data URLs if small) with size limits.

### 7.2 Visual Preferences

- **Fullscreen Mode:**
  - `/fullscreen` route or button to hide all chrome.
  - Ideal for workouts, presentations, or wall display.

- **Always-on-Top Floating Widget (where supported):**
  - Small, minimal mini-timer that can be overlaid.
  - Might require platform-specific Electron or PWA features in later versions.

- **Picture-in-Picture (PiP) Support:**
  - Use PiP API with a simple video surface that renders time visually.

- **Reduced Motion Mode:**
  - Fewer and gentler animations.
  - No particle effects or heavy transitions.

### 7.3 Data Features

#### 7.3.1 Session Persistence

- **Active Timer State (sessionStorage):**
  - Snapshot timer state every second (debounced):
    - `mode`, `startTime`, `elapsed`, `remaining`, `state`, etc.
  - Used for crash recovery and fast tab refresh behavior.

- **Long-Term Data (localStorage):**
  - Presets (countdown times, interval configurations).
  - History log (completed sessions with timestamps).
  - User preferences (theme, sound, shortcuts, reduced motion).

- **Crash Recovery:**
  - On load, reconcile stored timestamps with current `Date.now()`.
  - Resume timers accurately based on real elapsed time rather than accumulated intervals.

- **Tab Synchronization:**
  - Use `BroadcastChannel` to sync state across multiple tabs.
  - Only one tab is "primary controller"; others mirror or show a syncing indicator.

#### 7.3.2 History & Analytics

- **Session History:**
  - Log each completed timer with:
    - Mode
    - Duration / target
    - Actual elapsed time
    - Completion timestamp
  - For intervals: store number of rounds completed.

- **Statistics:**
  - Daily usage duration.
  - Most-used presets.
  - Longest stopwatch run.

- **Visual Charts (optional):**
  - Time distribution chart (e.g., bar graph of durations used).

- **Export:**
  - Export history as CSV or JSON.

### 7.4 Smart Features

#### 7.4.1 Preset Management

- Save custom presets with:
  - Name (`"Study 25"`, `"HIIT 20"`).
  - Icon / emoji.
  - Category: Work, Exercise, Cooking, Custom.

- **Favorites Bar:**
  - Pin frequently used presets to a top-row quick-launch bar.

- **Smart Suggestions:**
  - Basic heuristic: surface presets used most often at similar times of day or recently.

#### 7.4.2 Multi-Timer Support

- **Multiple countdown timers** can exist simultaneously.
- UI: stacked cards or compact list in countdown mode.
- Features:
  - Timer queue: define an ordered list that auto-starts the next timer on completion.
  - Group timers under a named workflow (e.g., "Kitchen", "Study Session").
  - Master `Pause All` / `Resume All` control.

---

## 8. Responsive Behavior

### 8.1 Mobile Optimization

- **Touch-first controls:**
  - Large buttons with adequate spacing.
  - Vertical layout with prioritized main timer.

- **Gestures:**
  - Swipe for mode switching.
  - Drag time wheels.

- **Wake Lock API:**
  - Prevent screen dimming/sleep while a timer is active (with user consent).

### 8.2 Desktop Enhancements

- **Keyboard Shortcuts Overlay:**
  - Triggered by `?` or a help icon.

- **Dock / Taskbar Integration (where supported):**
  - PWA enhancements (progress indicator in favicon or window title).

- **System Tray Notifications (PWA / Electron future):**
  - Show timer status in tray icon.

- **Multi-Monitor Awareness (future iteration):**
  - Option to choose which screen fullscreen mode appears on.

---

## 9. Accessibility

- **ARIA Live Regions:**
  - Announce key events: timer started, paused, finished, interval changes.

- **High Contrast Mode:**
  - Alternative palette with strong contrast ratios.

- **Screen Reader Semantics:**
  - Proper roles for buttons, tabs, and regions.
  - Descriptive labels for timers and laps.

- **Configurable Feedback:**
  - Allow user to choose between:
    - Visual-only
    - Audio-only
    - Both

- **Focus Management:**
  - Focus trap inside modals (settings, presets).
  - Predictable tab order.

- **Reduced Motion:**
  - Option to disable non-essential animations.
  - Respect OS-level reduced-motion settings.

---

## 10. Performance & Timing Accuracy

- **Timing Strategy:**
  - Use `Date.now()` or `performance.now()` and compute elapsed/remaining time as:
    - `elapsed = now - startTime + accumulatedOffset`.
  - Use `requestAnimationFrame` for smooth UI updates, but **logic** based on timestamps.

- **Background Accuracy:**
  - Mitigate tab throttling by recalculating based on timestamps whenever the app regains visibility.
  - Optional: Web Worker to maintain time deltas in background.

- **Performance Optimizations:**
  - Debounced state writes to `localStorage` / `sessionStorage`.
  - Lazy-load advanced views (history, analytics).
  - Memoize derived values (stats, charts).

---

## 11. Edge Cases & Polish

### 11.1 Edge Case Handling

- **Browser Tab Throttling:**
  - On `visibilitychange`, recompute current remaining/elapsed based on actual wall-clock time.

- **System Sleep/Wake:**
  - On wake, recompute using timestamps; optionally show a toast if the elapsed gap is large.

- **Time Zone Changes:**
  - Use timestamps (UTC) for persistence to avoid confusion.

- **Memory Pressure:**
  - Keep history size bounded (e.g., last N sessions) or allow user to clear.

- **Network Independence:**
  - App functions entirely offline once loaded; consider PWA manifest for installability.

### 11.2 Delight & Polish

- **Confetti / Celebration:**
  - Trigger on certain milestones (configurable, can be turned off).

- **Seasonal Themes (Optional):**
  - Subtle seasonal color variants (winter, summer, etc.).

- **Achievements:**
  - Soft gamification (e.g., "10 focus sessions completed today").

- **Shareable Timer Links:**
  - Generate URL with encoded preset configuration.
  - Opening link auto-configures timer, but does **not** start automatically (for safety).

- **Calendar Integration:**
  - Export completed sessions or repeating patterns as `.ics` files.

---

## 12. Implementation Priorities (MVP vs. Future)

**MVP Scope:**
- Countdown + Stopwatch modes.
- Single active timer per mode.
- Presets for countdown.
- Laps for stopwatch.
- Light/Dark theme and basic sound.
- Session and local persistence.
- Framer Motion for core transitions.

**V1.1 Enhancements:**
- Interval mode with basic Work/Rest.
- Fullscreen mode.
- Keyboard shortcuts overlay.
- History log (simple list).

**V2.0+ Enhancements:**
- Advanced interval sequences.
- Analytics and charts.
- PiP, Wake Lock, BroadcastChannel sync.
- Custom sound upload.
- Achievements, shareable links, calendar export.

---

This document serves as a complete engineering and UX specification for your Next.js + Framer Motion timer web app. It describes user flows, UI structure, behavior, timing logic, persistence, and advanced interaction details so your development team can translate it directly into implementation without ambiguity.

