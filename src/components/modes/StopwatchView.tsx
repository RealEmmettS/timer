import { memo, useState } from 'react';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import { TimerDisplay, formatTime } from '@/components/TimerDisplay';

const LapList = memo(function LapList({ laps }: { laps: number[] }) {
  if (!laps.length) return null;
  return (
    <div className="lap-scroll">
      <table className="laps">
        <caption className="sr-only">Stopwatch laps</caption>
        <thead>
          <tr>
            <th>Lap</th>
            <th>Split</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {laps
            .map((time, i) => (
              <tr key={i}>
                <th scope="row">{String(i + 1).padStart(2, '0')}</th>
                <td>{formatTime(time - (laps[i - 1] ?? 0), true)}</td>
                <td>{formatTime(time, true)}</td>
              </tr>
            ))
            .reverse()}
        </tbody>
      </table>
    </div>
  );
});

export default function StopwatchView({ active }: { active: boolean }) {
  const clock = useTimerEngine(active ? 50 : 0, 0);
  const [laps, setLaps] = useState<number[]>([]);
  if (!active) return null;
  return (
    <TimerDisplay
      label="Elapsed time"
      ms={clock.elapsed}
      progress={(clock.elapsed % 60000) / 60000}
      fraction
      elapsed={clock.elapsed}
      isRunning={clock.isRunning}
      status={clock.isRunning ? 'Timing' : clock.elapsed ? 'Paused' : 'Ready'}
      onToggle={clock.isRunning ? clock.pause : clock.start}
      onReset={() => {
        clock.reset();
        setLaps([]);
      }}
      onLap={() => {
        const time = clock.readElapsed();
        setLaps((prev) => [...prev, time]);
      }}
    >
      <LapList laps={laps} />
    </TimerDisplay>
  );
}
