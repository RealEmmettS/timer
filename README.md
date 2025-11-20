# Bauhaus Timer

A professional-grade, high-fidelity timer application built with Next.js, React, and Framer Motion. Inspired by the Bauhaus design philosophy of "form follows function," this app features a minimalist, geometric aesthetic with robust, high-accuracy timing.

![Bauhaus Timer Preview](https://placehold.co/800x400?text=Bauhaus+Timer+Preview)

## Features

### ⏱️ Precision Timing
- **Web Worker Engine**: Off-main-thread timing ensures accuracy even when the tab is inactive or throttled.
- **Drift Correction**: Logic to self-correct against system time deltas.

### 🎨 Bauhaus Design System
- **Functional Minimalism**: Stark contrasts, geometric shapes, and primary colors (Red, Blue, Yellow).
- **Interactive Background**: A subtle grid background that highlights interactively with cursor movement.
- **Motion Design**: Fluid transitions and "tactile" button interactions using Framer Motion.
- **Dark/Light Mode**: Fully supported themes that respect system settings or user override.

### 🚀 Modes
1.  **Countdown**:
    -   Visual circular progress ring.
    -   Smart presets (Pomodoro, 1m, 5m, etc.).
    -   Overtime tracking (visual shift to alert urgency).
2.  **Stopwatch**:
    -   Millisecond precision (`00:00.00`).
    -   Lap functionality with split time calculation.
    -   Unlimited lap history for the active session.
3.  **Interval**:
    -   High-intensity interval training (HIIT) support.
    -   Configurable **Work** and **Rest** durations.
    -   Round tracking and distinct visual phase indicators.

## Tech Stack

-   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Animation**: [Framer Motion](https://www.framer.com/motion/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Language**: TypeScript

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/bauhaus-timer.git
    cd bauhaus-timer
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
├── public/
│   └── timer.worker.js      # Web Worker for accurate timing
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/
│   │   ├── modes/           # Feature-specific views (Countdown, Stopwatch, Interval)
│   │   ├── shared/          # Reusable UI atoms (MotionButton, Input)
│   │   ├── TimerDisplay/    # Complex timer visualization components
│   │   └── ...
│   ├── context/             # Global state management (TimerContext)
│   ├── hooks/               # Custom hooks (useTimerEngine)
│   └── utils/               # Helpers (audio, time formatting)
```

## License

MIT
