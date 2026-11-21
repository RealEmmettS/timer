import { useEffect, useRef, useState } from 'react';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import { TimerDisplay } from '@/components/TimerDisplay';
import { DurationField, toMilliseconds, type Duration } from '@/components/shared/DurationField';
import { playComplete, prepareAudio } from '@/utils/audio';
import { hapticSelection, hapticSuccess } from '@/utils/haptics';

export default function CountdownView({ active, sound }: { active: boolean; sound: boolean }) {
  const clock = useTimerEngine();
  const [setting, setSetting] = useState<Duration>({ amount: 5, unit: 'min' });
  const duration = toMilliseconds(setting);
  const unitName = { sec: 'second', min: 'minute', hr: 'hour' }[setting.unit];
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
      <div className="settings countdown-settings">
        <DurationField label="Duration" duration={setting} disabled={clock.isRunning} onChange={setSetting} />
        <div className="adjust">
          <span className="setting-label">Quick adjust</span>
          <div className="steps">
            {[-1, 1, 5].map((n) => (
              <button
                type="button"
                key={n}
                disabled={clock.isRunning || (!duration && n < 0)}
                aria-label={`${n < 0 ? 'Subtract' : 'Add'} ${Math.abs(n)} ${unitName}${Math.abs(n) === 1 ? '' : 's'}`}
                onClick={() => {
                  hapticSelection();
                  setSetting((current) => {
                    const ms = toMilliseconds(current);
                    const stepMs = toMilliseconds({ amount: 1, unit: current.unit });
                    const adjusted = Math.max(0, ms + n * stepMs);
                    return Number.isSafeInteger(adjusted)
                      ? { amount: adjusted / stepMs, unit: current.unit }
                      : current;
                  });
                }}
              >
                {n < 0 ? '−' : '+'}
                {Math.abs(n)} {setting.unit}
              </button>
            ))}
          </div>
        </div>
      </div>
    </TimerDisplay>
  );
}
