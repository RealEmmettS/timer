import { DurationField, toMilliseconds, type Duration } from '@/components/shared/DurationField';
import { useEffect, useRef, useState } from 'react';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import { TimerDisplay } from '@/components/TimerDisplay';
import { NumberField } from '@/components/shared/NumberField';
import { prepareAudio, playComplete } from '@/utils/audio';
import { hapticNudge, hapticSuccess } from '@/utils/haptics';

type Phase = 'Work' | 'Rest';

function workoutLength(ms: number) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = (ms % 60000) / 1000;
  return (
    [hours && hours + 'h', minutes && minutes + 'm', seconds && seconds + 's'].filter(Boolean).join(' ') ||
    '0s'
  );
}

export default function IntervalView({ active, sound }: { active: boolean; sound: boolean }) {
  const clock = useTimerEngine();
  const [work, setWork] = useState<Duration>({ amount: 20, unit: 'sec' });
  const [rest, setRest] = useState<Duration>({ amount: 10, unit: 'sec' });
  const [rounds, setRounds] = useState(8);
  const [previewPhase, setPreviewPhase] = useState<Phase>('Work');
  const workMs = toMilliseconds(work);
  const restMs = toMilliseconds(rest);
  const cycle = workMs + restMs;
  const total = rounds * cycle;
  const round = Math.min(rounds, Math.floor(clock.elapsed / cycle) + 1);
  const inCycle = clock.elapsed % cycle;
  const isWork = inCycle < workMs;
  const complete = clock.elapsed >= total;
  const { isRunning, stopAt } = clock;
  const ready = !isRunning && clock.elapsed === 0;
  const phase = ready && previewPhase === 'Rest' && restMs > 0 ? 'Rest' : isWork ? 'Work' : 'Rest';
  const phaseDuration = phase === 'Work' ? workMs : restMs;
  const remaining = complete ? 0 : ready ? phaseDuration : (isWork ? workMs : cycle) - inCycle;
  const previousPhase = useRef(isWork);

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
  const state = complete
    ? 'Complete'
    : isRunning
      ? phase
      : !ready
        ? 'Paused'
        : phase === 'Rest'
          ? 'Rest preview'
          : 'Ready';
  return (
    <TimerDisplay
      label={complete ? 'Workout complete' : phase + ' interval'}
      ms={remaining}
      dialDuration={phaseDuration}
      progress={remaining / phaseDuration}
      elapsed={clock.elapsed}
      isRunning={isRunning}
      complete={complete}
      status={`${state} · Round ${round} of ${rounds}`}
      onToggle={() => {
        if (isRunning) clock.pause();
        else {
          setPreviewPhase('Work');
          if (sound) prepareAudio();
          clock.start();
        }
      }}
      onReset={() => {
        setPreviewPhase('Work');
        clock.reset();
      }}
    >
      <div className="settings interval-settings">
        <DurationField
          label="Work"
          minMs={1000}
          duration={work}
          disabled={isRunning}
          onChange={setWork}
          onPreview={() => setPreviewPhase('Work')}
        />
        <DurationField
          label="Rest"
          duration={rest}
          disabled={isRunning}
          onChange={setRest}
          onPreview={() => setPreviewPhase('Rest')}
        />
        <NumberField label="Rounds" value={rounds} min={1} disabled={isRunning} onChange={setRounds} />
        <div className="workout-total">
          <span className="setting-label">Workout total</span>
          <span>{workoutLength(total)}</span>
        </div>
      </div>
    </TimerDisplay>
  );
}
