import {
  memo,
  useId,
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
  SECOND,
  6 * SECOND,
  12 * SECOND,
  30 * SECOND,
  MINUTE,
  3 * MINUTE,
  30 * MINUTE,
  HOUR,
  2 * HOUR,
  6 * HOUR,
  12 * HOUR,
  24 * HOUR,
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

function numeral(span: number, hour: number) {
  const [total] = faceUnits(span);
  const value = (total * hour) / 12;
  if (!Number.isInteger(value)) return '';
  const text = value >= 10000 ? compact.format(value) : String(value);
  return total === 60 ? text.padStart(2, '0') : text;
}

function Register({
  value,
  previous,
  x,
  y,
  className,
  clip,
  step,
  delay,
  onSettled,
}: {
  value: string;
  previous?: string;
  x: number;
  y: number;
  className: string;
  clip: string;
  step: number;
  delay: number;
  onSettled?: () => void;
}) {
  if (!value && !previous) return null;
  if (previous === undefined || previous === value) {
    return (
      <text x={x} y={y} className={className} style={{ '--mark-delay': delay + 'ms' } as CSSProperties}>
        {value}
      </text>
    );
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <g clipPath={`url(#${clip})`}>
        <g
          key={value}
          className="dial-roll"
          style={{ '--roll-step': step + 'px', '--roll-delay': delay + 'ms' } as CSSProperties}
          onAnimationEnd={onSettled}
        >
          {previous && (
            <text y={-step} className={className + ' dial-old-value'} aria-hidden="true">
              {previous}
            </text>
          )}
          {value && <text className={className}>{value}</text>}
        </g>
      </g>
    </g>
  );
}

type Roll = { previous: number; step: number; onSettled: () => void };

const DialFace = memo(function DialFace({
  span,
  adaptive,
  roll,
}: {
  span: number;
  adaptive: boolean;
  roll?: Roll;
}) {
  const clip = useId();
  const labels = [];
  for (let hour = 0; hour < 12; hour++) {
    const radians = (hour * Math.PI) / 6;
    labels.push(
      <Register
        key={hour}
        value={numeral(span, hour)}
        previous={roll && numeral(roll.previous, hour)}
        className={hour % 3 === 0 ? 'dial-quarter' : 'dial-subdivision'}
        x={Number((120 + Math.sin(radians) * 77).toFixed(2))}
        y={Number((120 - Math.cos(radians) * 77).toFixed(2))}
        clip={clip}
        step={roll?.step ?? 0}
        delay={hour * (roll ? 5 : 9)}
      />,
    );
  }
  return (
    <g className="dial-face">
      <defs>
        <clipPath id={clip}>
          <rect x="-80" y="-10" width="160" height="20" />
        </clipPath>
      </defs>
      <g className="dial-marks">{watchMarks}</g>
      <g className="dial-labels">{labels}</g>
      <Register
        className="dial-unit"
        value={adaptive ? legend(span) : 'sec'}
        previous={roll && legend(roll.previous)}
        x={120}
        y={adaptive ? 150 : 157}
        clip={clip}
        step={roll?.step ?? 0}
        delay={65}
        onSettled={roll?.onSettled}
      />
      {adaptive && (
        <text className="dial-per-turn" x="120" y="163">
          per turn
        </text>
      )}
    </g>
  );
});

const ScalePlate = memo(function ScalePlate({
  span,
  phase,
}: {
  span: number;
  phase?: IntervalBeat['phase'];
}) {
  const [plate, setPlate] = useState<{ span: number; previous: number | null }>({ span, previous: null });
  if (span !== plate.span) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPlate({ span, previous: reduce ? null : plate.span });
  }
  const settled = () => setPlate({ span, previous: null });

  if (phase) {
    const roll =
      plate.previous === null
        ? undefined
        : {
            previous: plate.previous,
            step: phase === 'Rest' ? -22 : 22,
            onSettled: settled,
          };
    return <DialFace span={span} adaptive roll={roll} />;
  }

  return (
    <>
      {plate.previous !== null && (
        <g
          key={'out-' + plate.previous}
          className="dial-outgoing"
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) settled();
          }}
        >
          <DialFace span={plate.previous} adaptive />
        </g>
      )}
      <g key={span} className="dial-incoming">
        <DialFace span={span} adaptive />
      </g>
    </>
  );
});

export type IntervalBeat = { phase: 'Work' | 'Rest'; round: number };

export type DialHandle = { prepareReset: (direction: 'clockwise' | 'counterclockwise') => void };

export const Dial = memo(function Dial({
  ref,
  ms,
  duration,
  interval,
  atStart,
}: {
  ref: Ref<DialHandle>;
  ms: number;
  duration?: number;
  interval?: IntervalBeat;
  atStart: boolean;
}) {
  const adaptive = duration !== undefined;
  const span = duration === undefined ? MINUTE : watchSpan(duration);
  const angle = (ms / span) * 360;
  const needle = useRef<SVGPathElement>(null);
  const hand = useRef<SVGGElement>(null);
  const phaseKey = interval && `${interval.round}-${interval.phase}`;
  const lastPhase = useRef(phaseKey);
  // Matrix interpolation takes the short arc even when a phase change crosses twelve.
  const radians = ((angle % 360) * Math.PI) / 180;
  const transform = interval
    ? `matrix(${Math.cos(radians)}, ${Math.sin(radians)}, ${-Math.sin(radians)}, ${Math.cos(radians)}, 0, 0)`
    : `rotate(${angle}deg)`;
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
    if (phaseKey === undefined) return;
    const changed = lastPhase.current !== phaseKey;
    hand.current?.classList.toggle('dial-indexing', changed && rewind.current === null);
    lastPhase.current = phaseKey;
  }, [phaseKey, angle]);

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
  }, [resetAngle, span, phaseKey]);

  return (
    <svg
      className="dial"
      viewBox="0 0 240 240"
      role={adaptive ? 'img' : undefined}
      aria-hidden={adaptive ? undefined : true}
      aria-label={adaptive ? legend(span) + ' per turn' : undefined}
    >
      <circle className="dial-rim" cx="120" cy="120" r="116" />
      <circle className="dial-track" cx="120" cy="120" r="89" />
      {adaptive ? (
        <ScalePlate span={span} phase={interval?.phase} />
      ) : (
        <DialFace span={span} adaptive={false} />
      )}
      <g ref={hand} className="dial-hand" data-interval={!!interval} style={{ transform }}>
        <g key={interval ? 'interval' : span} className={adaptive && !interval ? 'dial-settle' : undefined}>
          <path ref={needle} className="needle" d="M119 21 Q120 17 121 21 L123 133 Q120 138 117 133Z" />
        </g>
      </g>
      <circle className="pin" cx="120" cy="120" r="7" />
      <circle className="pin-inner" cx="120" cy="120" r="2.5" />
    </svg>
  );
});
