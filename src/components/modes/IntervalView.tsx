import { useEffect, useRef, useState } from 'react';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import { TimerDisplay } from '@/components/TimerDisplay';
import { NumberField } from '@/components/shared/NumberField';
import { prepareAudio, playComplete } from '@/utils/audio';
import { hapticNudge, hapticSuccess } from '@/utils/haptics';

export default function IntervalView({ active, sound }: { active: boolean; sound: boolean }) {
  const clock = useTimerEngine();
  const [work, setWork] = useState(20);
  const [rest, setRest] = useState(10);
  const [rounds, setRounds] = useState(8);
  const cycle = (work + rest) * 1000;
  const total = rounds * cycle;
  const round = Math.min(rounds, Math.floor(clock.elapsed / cycle) + 1);
  const inCycle = clock.elapsed % cycle;
  const isWork = inCycle < work * 1000;
  const complete = clock.elapsed >= total;
  const remaining = complete ? 0 : (isWork ? work * 1000 : cycle) - inCycle;
  const phase = isWork ? 'Work' : 'Rest';
  const previousPhase = useRef(isWork);
  const { isRunning, stopAt } = clock;
  useEffect(() => {
    if (isRunning && complete) {
      stopAt(total);
      if (sound) playComplete();
      hapticSuccess();
    } else if (isRunning && previousPhase.current !== isWork) {
      hapticNudge();
    }
    previousPhase.current = isWork;
  }, [isRunning, complete, isWork, total, sound, stopAt]);

  if (!active) return null;
  return (
    <TimerDisplay
      label={complete ? 'Workout complete' : phase + ' interval'}
      ms={remaining}
      unit="sec"
      progress={complete ? 0 : remaining / ((isWork ? work : rest) * 1000)}
      elapsed={clock.elapsed}
      isRunning={isRunning}
      complete={complete}
      status={`${complete ? 'Complete' : isRunning ? phase : clock.elapsed ? 'Paused' : 'Ready'} · Round ${round} of ${rounds}`}
      onToggle={() => {
        if (isRunning) clock.pause();
        else {
          if (sound) prepareAudio();
          clock.start();
        }
      }}
      onReset={clock.reset}
    >
      <div className="settings interval-settings">
        <NumberField label="Work" unit="sec" value={work} min={1} disabled={isRunning} onChange={setWork} />
        <NumberField label="Rest" unit="sec" value={rest} min={0} disabled={isRunning} onChange={setRest} />
        <NumberField label="Rounds" value={rounds} min={1} disabled={isRunning} onChange={setRounds} />
      </div>
    </TimerDisplay>
  );
}
