import { useEffect, useRef, useState } from 'react';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import { TimerDisplay } from '@/components/TimerDisplay';
import { NumberField } from '@/components/shared/NumberField';
import { playComplete, prepareAudio } from '@/utils/audio';
import { hapticSelection, hapticSuccess } from '@/utils/haptics';

export default function CountdownView({ active, sound }: { active: boolean; sound: boolean }) {
  const clock = useTimerEngine();
  const [duration, setDuration] = useState(300000);
  const remaining = duration - clock.elapsed;
  const signaled = useRef(false);
  useEffect(() => {
    if (remaining > 0 || (!clock.elapsed && !clock.isRunning)) signaled.current = false;
    if (remaining <= 0 && clock.isRunning && !signaled.current) {
      signaled.current = true;
      if (sound) playComplete();
      hapticSuccess();
    }
  }, [remaining, clock.isRunning, clock.elapsed, sound]);
  if (!active) return null;
  return (
    <TimerDisplay
      label="Time remaining"
      ms={Math.abs(remaining)}
      dialDuration={duration}
      progress={duration ? remaining / duration : 0}
      elapsed={clock.elapsed}
      isRunning={clock.isRunning}
      overtime={remaining < 0}
      status={
        remaining < 0
          ? clock.isRunning
            ? 'Overtime'
            : 'Paused · overtime'
          : clock.isRunning
            ? 'Counting down'
            : clock.elapsed
              ? 'Paused'
              : 'Ready'
      }
      onToggle={() => {
        if (clock.isRunning) clock.pause();
        else {
          if (sound) prepareAudio();
          clock.start();
        }
      }}
      onReset={clock.reset}
    >
      <div className="settings">
        <NumberField
          label="Duration"
          unit="min"
          value={duration / 60000}
          min={0}
          step="any"
          disabled={clock.isRunning}
          onChange={(n) => setDuration(Math.round(n * 60000))}
        />
        <div className="adjust">
          <span className="setting-label">Quick adjust</span>
          <div className="steps">
            {[-1, 1, 5].map((n) => (
              <button
                type="button"
                key={n}
                disabled={clock.isRunning || (!duration && n < 0)}
                aria-label={`${n < 0 ? 'Subtract' : 'Add'} ${Math.abs(n)} ${Math.abs(n) === 1 ? 'minute' : 'minutes'}`}
                onClick={() => {
                  hapticSelection();
                  setDuration((current) => Math.max(0, current + n * 60000));
                }}
              >
                {n < 0 ? '−' : '+'}
                {Math.abs(n)} min
              </button>
            ))}
          </div>
        </div>
      </div>
    </TimerDisplay>
  );
}
