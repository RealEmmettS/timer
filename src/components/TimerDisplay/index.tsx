import { memo, useEffect, useEffectEvent, type CSSProperties, type ReactNode } from 'react';
import { Flag, Pause, Play, RotateCcw } from 'lucide-react';
import { hapticMedium, hapticRigid, hapticSoft, hapticWarning } from '@/utils/haptics';

const DialFace = memo(function DialFace() {
  return (
    <g className="dial-face">
      <circle className="dial-rim" cx="120" cy="120" r="116" />
      <circle className="dial-track" cx="120" cy="120" r="89" />
      {Array.from({ length: 60 }, (_, i) => (
        <line
          key={i}
          x1="120"
          x2="120"
          y1="14"
          y2={i % 5 === 0 ? 28 : 20}
          className={i % 5 === 0 ? 'major' : 'minor'}
          transform={`rotate(${i * 6} 120 120)`}
        />
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <text
            key={i}
            className={i % 3 ? 'dial-subdivision' : 'dial-quarter'}
            x={(120 + Math.sin(a) * 77).toFixed(2)}
            y={(120 - Math.cos(a) * 77).toFixed(2)}
          >
            {String(i * 5).padStart(2, '0')}
          </text>
        );
      })}
    </g>
  );
});

const Dial = memo(function Dial({ value, unit }: { value: number; unit: 'min' | 'sec' }) {
  const angle = value * 6;
  return (
    <svg className="dial" viewBox="0 0 240 240" aria-hidden="true">
      <DialFace />
      <text className="dial-unit" x="120" y="157">
        {unit}
      </text>
      <g className="dial-hand" style={{ transform: `rotate(${angle}deg)` }}>
        <path className="needle" d="M119 21 Q120 17 121 21 L123 133 Q120 138 117 133Z" />
      </g>
      <circle className="pin" cx="120" cy="120" r="7" />
      <circle className="pin-inner" cx="120" cy="120" r="2.5" />
    </svg>
  );
});

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
  unit: 'min' | 'sec';
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
  unit,
  progress,
  fraction,
  overtime,
  complete,
  children,
}: Props) {
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
      <div className="face" data-running={isRunning}>
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
          <Dial key={label} value={unit === 'min' ? ms / 60000 : Math.floor(ms / 1000)} unit={unit} />
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(0, Math.min(1, progress))})` }} />
        </div>
      </div>
      {children}
    </section>
  );
}
