import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import { TimerDisplay } from '@/components/TimerDisplay';
import { NumberField } from '@/components/shared/NumberField';
import { prepareAudio, playComplete } from '@/utils/audio';
import { hapticNudge, hapticSuccess } from '@/utils/haptics';

const unitMs = { sec: 1000, min: 60000, hr: 3600000 };
type Unit = keyof typeof unitMs;
type Duration = { amount: number; unit: Unit };
type Phase = 'Work' | 'Rest';

declare global {
  interface Window {
    ShaughvDropdown?: { mount: (options: { root: HTMLElement }) => { destroy(): void } };
  }
}

function toMs({ amount, unit }: Duration) {
  return Math.round(amount * unitMs[unit]);
}

function workoutLength(ms: number) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = (ms % 60000) / 1000;
  return (
    [hours && hours + 'h', minutes && minutes + 'm', seconds && seconds + 's'].filter(Boolean).join(' ') ||
    '0s'
  );
}

function PhaseField({
  phase,
  duration,
  disabled,
  onChange,
  onPreview,
}: {
  phase: Phase;
  duration: Duration;
  disabled: boolean;
  onChange: (duration: Duration) => void;
  onPreview: () => void;
}) {
  const minMs = phase === 'Work' ? 1000 : 0;
  const { unit, amount } = duration;
  function change(next: Duration) {
    if (!Number.isSafeInteger(toMs(next))) return;
    onPreview();
    onChange(next);
  }
  return (
    <NumberField
      label={phase}
      value={amount}
      unit={unit}
      min={minMs / unitMs[unit]}
      step="any"
      disabled={disabled}
      onFocus={onPreview}
      onChange={(n) => change({ amount: n, unit })}
    >
      <span className="unit-picker">
        <select
          aria-label={phase + ' time unit'}
          value={unit}
          disabled={disabled}
          onChange={(event) => {
            const nextUnit = event.currentTarget.value as Unit;
            change({ amount: Math.max(amount, minMs / unitMs[nextUnit]), unit: nextUnit });
          }}
        >
          <option value="sec">sec</option>
          <option value="min">min</option>
          <option value="hr">hr</option>
        </select>
      </span>
    </NumberField>
  );
}

export default function IntervalView({ active, sound }: { active: boolean; sound: boolean }) {
  const clock = useTimerEngine();
  const [work, setWork] = useState<Duration>({ amount: 20, unit: 'sec' });
  const [rest, setRest] = useState<Duration>({ amount: 10, unit: 'sec' });
  const [rounds, setRounds] = useState(8);
  const [previewPhase, setPreviewPhase] = useState<Phase>('Work');
  const [dropdownReady, setDropdownReady] = useState(false);
  const settings = useRef<HTMLDivElement>(null);
  const workMs = toMs(work);
  const restMs = toMs(rest);
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
    if (!active || !dropdownReady || !settings.current) return;
    const controls = window.ShaughvDropdown?.mount({ root: settings.current });
    return () => controls?.destroy();
  }, [active, dropdownReady]);

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
      <div className="settings interval-settings" ref={settings}>
        <PhaseField
          phase="Work"
          duration={work}
          disabled={isRunning}
          onChange={setWork}
          onPreview={() => setPreviewPhase('Work')}
        />
        <PhaseField
          phase="Rest"
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
      <Script
        src="https://cdn.shaughv.com/js/shaughv-dropdown.js?v=2026-10-21.2"
        onReady={() => setDropdownReady(true)}
      />
    </TimerDisplay>
  );
}
