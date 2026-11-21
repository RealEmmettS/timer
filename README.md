# SHAUGHV Timer

A countdown, stopwatch, and interval timer for the browser. Each mode keeps its time when you switch to another. The digital readout uses Geist Mono and the interface uses Makira, both hosted on the SHAUGHV CDN.

- The countdown accepts fractional minutes and continues into overtime. Quick adjustments are available while paused.
- The stopwatch records lap splits and cumulative times. It displays hundredths and samples the clock independently when you record a lap or pause.
- Intervals have configurable work and rest durations and a round count. The chime respects the sound control, including while another mode is open.
- Space starts or pauses the visible timer when the page itself has focus. Timers support light and dark themes, reduced motion, and touch.

## Development

Run `npm ci`, then `npm run dev`. Check changes with `npm run lint` and `npm run build`.

## Timing and motion

Each mode owns an instance of `useTimerEngine`. Elapsed time comes from the start timestamp. The worker schedules updates aligned to that timestamp. Idle timers have no worker, and an offscreen stopwatch keeps time without refreshing its display. Browsers may defer alarms while a device sleeps.

The dial, buttons, and lap list use short CSS transitions. The pointer-driven grid is confined to the uncovered workspace and has no idle animation loop.

## License

MIT
