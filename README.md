# SHAUGHV Timer

A countdown, stopwatch, and interval timer for the browser. Each mode keeps its time when you switch to another. The digital readout uses Geist Mono and the interface uses Makira, both hosted on the SHAUGHV CDN.

- In Countdown, Work, and Rest, enter a number and choose seconds, minutes, or hours, or type a shortcut like `2s`, `34m`, or `1.5h`. Press Enter or leave the field to show the number and selected unit separately.
- Countdown and interval dials use a fixed watch scale for each run or phase. A five-minute countdown starts at the five-minute mark on a 30-minute face. A 56-minute countdown uses the same 60-minute face as a full hour. Reset rewinds to the selected time.
- The countdown continues into overtime. Quick adjustments use the selected unit and are available while the countdown is idle or paused.
- The stopwatch records lap splits and cumulative times. It displays hundredths and samples the clock independently when you record a lap or pause.
- Work and rest each accept seconds, minutes, or hours. Editing a phase previews its dial and updates the workout total across all rounds. Each phase keeps its own scale while running. The chime respects the sound control, including while another mode is open.
- Space starts or pauses the visible timer when the page itself has focus. Timers support light and dark themes, reduced motion, and touch.

## Development

Run `npm ci`, then `npm run dev`. Check changes with `npm run lint` and `npm run build`.

## Timing and motion

Each mode owns an instance of `useTimerEngine`. Elapsed time comes from the start timestamp. The worker schedules updates aligned to that timestamp. Idle timers have no worker, and an offscreen stopwatch keeps time without refreshing its display. Browsers may defer alarms while a device sleeps.

The dial, buttons, and lap list use short CSS transitions. The pointer-driven grid is confined to the uncovered workspace and has no idle animation loop.

## License

MIT
