import { useEffect, useEffectEvent, useRef, type CSSProperties, type ReactNode } from 'react';
import { Flag, Pause, Play, RotateCcw } from 'lucide-react';
import { hapticMedium, hapticRigid, hapticSoft, hapticWarning } from '@/utils/haptics';

import { Dial, type DialHandle, type IntervalBeat } from './Dial';

export function formatTime(ms: number, fraction = false, roundUp = false) {
  const seconds = (roundUp ? Math.ceil : Math.floor)(Math.max(0, ms) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const hours = Math.floor(seconds / 3600);
  const clock =
    (hours ? pad(hours) + ':' : '') + pad(Math.floor(seconds / 60) % 60) + ':' + pad(seconds % 60);
  return fraction ? clock + '.' + pad(Math.floor(ms / 10) % 100) : clock;
}

type Props = {
  label: string;
  ms: number;
  status: string;
  isRunning: boolean;
  elapsed: number;
  onToggle: () => void;
  onReset: () => void;
  onLap?: () => void;
  dialDuration?: number;
  interval?: IntervalBeat;
  progress: number;
  fraction?: boolean;
  overtime?: boolean;
  complete?: boolean;
  children?: ReactNode;
};

export function TimerDisplay({
  label,
  ms,
  status,
  elapsed,
  isRunning,
  onToggle,
  onReset,
  onLap,
  dialDuration,
  interval,
  progress,
  fraction,
  overtime,
  complete,
  children,
}: Props) {
  const dial = useRef<DialHandle>(null);
  const time = formatTime(ms, fraction, !fraction && !overtime);
  const [whole, decimal] = time.split('.');
  const toggle = () => {
    if (complete) return;
    (isRunning ? hapticSoft : hapticMedium)();
    onToggle();
  };
  const shortcut = useEffectEvent(toggle);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (
        event.code !== 'Space' ||
        event.repeat ||
        event.altKey ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        !(event.target === document.body || event.target === document.documentElement)
      )
        return;
      event.preventDefault();
      shortcut();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <section className="instrument" aria-label={label}>
      <div
        className="face"
        data-running={isRunning}
        data-ready={!isRunning && !elapsed}
        data-adaptive={dialDuration !== undefined}
      >
        <div className="face-body">
          <h2 className="face-title">{label}</h2>
          <div className="readout-wrap">
            <div
              className="readout"
              role="timer"
              aria-live="off"
              style={
                { '--time-chars': whole.length + (decimal ? 1.6 : 0) + (overtime ? 0.6 : 0) } as CSSProperties
              }
            >
              {overtime && <small>+</small>}
              {whole.slice(0, -2)}
              <span className="seconds" key={whole}>
                {whole.slice(-2)}
              </span>
              {decimal && <small>.{decimal}</small>}
            </div>
          </div>
          <div className="status" data-active={isRunning} data-alert={overtime} role="status">
            <i aria-hidden="true" />
            {status}
          </div>
          <div className="actions">
            <button
              type="button"
              className="primary"
              onClick={toggle}
              disabled={complete}
              aria-keyshortcuts="Space"
            >
              {isRunning ? <Pause /> : <Play />}
              {isRunning ? 'Pause' : complete ? 'Done' : elapsed ? 'Resume' : 'Start'}
              <kbd aria-hidden="true">Space</kbd>
            </button>
            <button
              type="button"
              className="secondary"
              disabled={!elapsed && !isRunning}
              onClick={() => {
                hapticWarning();
                const direction = dialDuration === undefined || overtime ? 'counterclockwise' : 'clockwise';
                dial.current?.prepareReset(direction);
                onReset();
              }}
            >
              <RotateCcw />
              Reset
            </button>
            {onLap && (
              <button
                type="button"
                className="secondary"
                disabled={!isRunning}
                onClick={() => {
                  hapticRigid();
                  onLap();
                }}
              >
                <Flag />
                Lap
              </button>
            )}
          </div>
        </div>
        <div className="dial-well">
          <Dial
            ref={dial}
            atStart={!elapsed && !isRunning}
            ms={dialDuration === undefined ? Math.floor(ms / 1000) * 1000 : ms}
            duration={dialDuration}
            interval={interval}
          />
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(0, Math.min(1, progress))})` }} />
        </div>
      </div>
      {children}
    </section>
  );
}
