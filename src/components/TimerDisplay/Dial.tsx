import {
  memo,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from 'react';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

const watchSpans = [
  SECOND, 6 * SECOND, 12 * SECOND, 30 * SECOND, MINUTE, 3 * MINUTE,
  30 * MINUTE, HOUR, 2 * HOUR, 6 * HOUR, 12 * HOUR, 24 * HOUR,
];

function watchSpan(duration: number) {
  if (duration === 0) return MINUTE;
  const preset = watchSpans.find((span) => duration <= span);
  if (preset) return preset;
  const days = duration / (24 * HOUR);
  const magnitude = 10 ** Math.floor(Math.log10(days));
  const step = [1, 2, 5, 10].find((n) => n * magnitude >= days) ?? 10;
  return step * magnitude * 24 * HOUR;
}

function faceUnits(span: number): [number, string] {
  if (span <= SECOND) return [span, 'ms'];
  if (span <= 3 * MINUTE) return [span / SECOND, 'sec'];
  if (span <= 2 * HOUR) return [span / MINUTE, 'min'];
  return [span / HOUR, 'hr'];
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

function legend(span: number) {
  const [amount, unit] = faceUnits(span);
  return (amount >= 10000 ? compact.format(amount) : amount) + ' ' + unit;
}

const watchMarks = Array.from({ length: 60 }, (_, i) => (
  <line
    key={i}
    x1="120"
    x2="120"
    y1="14"
    y2={i % 5 === 0 ? 28 : 20}
    className={i % 5 === 0 ? 'major' : 'minor'}
    transform={`rotate(${i * 6} 120 120)`}
  />
));

const DialFace = memo(function DialFace({ span, adaptive }: { span: number; adaptive: boolean }) {
  const [total, unit] = faceUnits(span);
  const labels = [];
  for (let i = 0; i < 12; i++) {
    const value = (total * i) / 12;
    // On a half-hour face, label every five minutes and leave the half steps as hour marks.
    if (!Number.isInteger(value)) continue;
    const label = value >= 10000 ? compact.format(value) : String(value);
    const text = (unit === 'min' || unit === 'sec') && total === 60 ? label.padStart(2, '0') : label;
    const radians = i * Math.PI / 6;
    labels.push(
      <text
        key={i}
        className={i % 3 === 0 ? 'dial-quarter' : 'dial-subdivision'}
        style={adaptive ? ({ '--mark-delay': i * 9 + 'ms' } as CSSProperties) : undefined}
        x={(120 + Math.sin(radians) * 77).toFixed(2)}
        y={(120 - Math.cos(radians) * 77).toFixed(2)}
      >
        {text}
      </text>,
    );
  }
  return (
    <g className="dial-face">
      <g className="dial-marks">{watchMarks}</g>
      <g className="dial-labels">{labels}</g>
      <text className="dial-unit" x="120" y={adaptive ? 150 : 157}>
        {adaptive ? legend(span) : 'sec'}
      </text>
      {adaptive && (
        <text className="dial-per-turn" x="120" y="163">
          per turn
        </text>
      )}
    </g>
  );
});

const ScalePlate = memo(function ScalePlate({ span }: { span: number }) {
  const [plate, setPlate] = useState<{ current: number; previous: number | null }>({
    current: span,
    previous: null,
  });
  if (span !== plate.current) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPlate({ current: span, previous: reduce ? null : plate.current });
  }
  return (
    <>
      {plate.previous !== null && (
        <g
          className="dial-outgoing"
          key={'out-' + plate.previous}
          onAnimationEnd={(event) => {
            if (event.currentTarget === event.target) setPlate({ current: span, previous: null });
          }}
        >
          <DialFace span={plate.previous} adaptive />
        </g>
      )}
      <g className="dial-incoming" key={span}>
        <DialFace span={span} adaptive />
      </g>
    </>
  );
});

export type DialHandle = { prepareReset: (direction: 'clockwise' | 'counterclockwise') => void };

export const Dial = memo(function Dial({
  ref,
  ms,
  duration,
  phase,
  atStart,
}: {
  ref: Ref<DialHandle>;
  ms: number;
  duration?: number;
  phase: string;
  atStart: boolean;
}) {
  const adaptive = duration !== undefined;
  const span = duration === undefined ? MINUTE : watchSpan(duration);
  const angle = (ms / span) * 360;
  const needle = useRef<SVGPathElement>(null);
  const hand = useRef<SVGGElement>(null);
  const resetAngle = atStart ? angle : null;
  const rewind = useRef<{ degrees: number; clockwise: boolean } | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      prepareReset(direction) {
        // Sample the painted angle before reset changes the time or replaces the interval phase.
        const pose = needle.current?.getCTM();
        if (!pose) return;
        const degrees = ((Math.atan2(pose.b, pose.a) * 180) / Math.PI + 360) % 360;
        rewind.current = { degrees, clockwise: direction === 'clockwise' };
      },
    }),
    [],
  );

  useLayoutEffect(() => {
    const pose = rewind.current;
    rewind.current = null;
    const element = hand.current;
    if (resetAngle === null || !pose || !element) return;
    const distance = (pose.degrees - resetAngle + 360) % 360;
    const atTarget = Math.min(distance, 360 - distance) < 0.01;
    const offset = atTarget ? 0 : pose.clockwise ? distance - 360 : distance;
    element.style.setProperty('--rewind-from', resetAngle + offset + 'deg');
    element.style.setProperty('--rewind-to', resetAngle + 'deg');
    const durationMs = offset === 0 ? 0 : Math.round(240 + Math.abs(offset) * 1.2);
    element.style.setProperty('--rewind-duration', durationMs + 'ms');
    element.classList.add('dial-rewinding');
    return () => element.classList.remove('dial-rewinding');
  }, [resetAngle, span, phase]);

  return (
    <svg className="dial" viewBox="0 0 240 240" role={adaptive ? 'img' : undefined} aria-hidden={adaptive ? undefined : true} aria-label={adaptive ? legend(span) + ' per turn' : undefined}>
      <circle className="dial-rim" cx="120" cy="120" r="116" />
      <circle className="dial-track" cx="120" cy="120" r="89" />
      {adaptive ? <ScalePlate span={span} /> : <DialFace span={span} adaptive={false} />}
      <g ref={hand} key={phase} className="dial-hand" style={{ transform: `rotate(${angle}deg)` }}>
        <g key={span} className={adaptive ? 'dial-settle' : undefined}>
          <path ref={needle} className="needle" d="M119 21 Q120 17 121 21 L123 133 Q120 138 117 133Z" />
        </g>
      </g>
      <circle className="pin" cx="120" cy="120" r="7" />
      <circle className="pin-inner" cx="120" cy="120" r="2.5" />
    </svg>
  );
});
