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

// Major/minor tick spacing, in seconds. Prefer divisions people can read as clock time.
const timeSteps = [
  [0.001, 0.0002],
  [0.002, 0.0005],
  [0.005, 0.001],
  [0.01, 0.002],
  [0.02, 0.005],
  [0.05, 0.01],
  [0.1, 0.02],
  [0.2, 0.05],
  [0.5, 0.1],
  [1, 0.2],
  [2, 0.5],
  [5, 1],
  [10, 2],
  [15, 3],
  [30, 5],
  [60, 5],
  [120, 15],
  [300, 30],
  [600, 60],
  [900, 180],
  [1800, 300],
  [3600, 600],
  [7200, 900],
  [10800, 1800],
  [21600, 3600],
];

function tickSpacing(span: number) {
  if (span === MINUTE) return [5000, 1000];
  const targetSeconds = span / SECOND / 8;
  const step = timeSteps.find(([major]) => major >= targetSeconds);
  if (step) return step.map((seconds) => seconds * SECOND);
  const targetHours = targetSeconds / 3600;
  const order = 10 ** Math.floor(Math.log10(targetHours));
  const factor = [1, 2, 5, 10].find((value) => value * order >= targetHours) ?? 10;
  const major = factor * order * HOUR;
  return [major, major / 5];
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

function scaleText(span: number, value: number, major: number) {
  if (span < SECOND) return String(Math.round(value));
  if (span < 2 * MINUTE) return String(Number((value / SECOND).toFixed(3)));
  const unit = span < HOUR ? MINUTE : HOUR;
  if (value / unit >= 10000) return compact.format(value / unit);
  if (major % unit === 0 && unit === MINUTE) return String(value / unit);
  const whole = Math.floor(value / unit);
  const part = Math.round(((value % unit) / unit) * 60);
  return whole + ':' + String(part).padStart(2, '0');
}

function legend(span: number) {
  const [amount, unit]: [number, string] =
    span < SECOND
      ? [span, 'ms']
      : span < 2 * MINUTE
        ? [span / SECOND, 'sec']
        : span < HOUR
          ? [span / MINUTE, 'min']
          : [span / HOUR, 'hr'];
  return (amount >= 10000 ? compact.format(amount) : Number(amount.toFixed(3))) + ' ' + unit;
}

const DialFace = memo(function DialFace({ span, adaptive }: { span: number; adaptive: boolean }) {
  const [major, minor] = tickSpacing(span);
  const majorEvery = Math.round(major / minor);
  const marks = Math.ceil(span / minor);
  const compactEvery = adaptive ? Math.ceil(span / major / 5.5) : 3;
  const labels = [];
  const ticks = [];
  for (let i = 0; i < marks; i++) {
    const value = i * minor;
    const angle = (value / span) * 360;
    const isMajor = i % majorEvery === 0;
    // An odd duration can put the last tick almost on top of zero.
    if (360 - angle < 2) break;
    ticks.push(
      <line
        key={i}
        x1="120"
        x2="120"
        y1="14"
        y2={isMajor ? 28 : 20}
        className={isMajor ? 'major' : 'minor'}
        transform={`rotate(${angle} 120 120)`}
      />,
    );
    if (!isMajor || 360 - angle < 25) continue;
    const index = i / majorEvery;
    const compactLabel = index % compactEvery === 0 && 360 - angle >= 50;
    const a = (angle * Math.PI) / 180;
    const label = adaptive ? scaleText(span, value, major) : String(value / SECOND).padStart(2, '0');
    const radius = label.length > 3 ? 69 : 77;
    labels.push(
      <text
        key={i}
        className={compactLabel ? 'dial-quarter' : 'dial-subdivision'}
        style={adaptive ? ({ '--mark-delay': index * 9 + 'ms' } as CSSProperties) : undefined}
        x={(120 + Math.sin(a) * radius).toFixed(2)}
        y={(120 - Math.cos(a) * radius).toFixed(2)}
      >
        {label}
      </text>,
    );
  }
  return (
    <g className="dial-face">
      <g className="dial-marks">{ticks}</g>
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
  const span = duration || MINUTE; // A zero-duration countdown starts directly in overtime.
  const angle = (ms / span) * 360;
  const needle = useRef<SVGPathElement>(null);
  const hand = useRef<SVGGElement>(null);
  const rewindFrom = useRef<number | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      prepareReset(direction) {
        // Sample the painted angle before reset changes the time or replaces the interval phase.
        const pose = needle.current?.getCTM();
        if (!pose) return;
        const degrees = ((Math.atan2(pose.b, pose.a) * 180) / Math.PI + 360) % 360;
        const atHome = Math.min(degrees, 360 - degrees) < 0.01;
        const from = direction === 'clockwise' ? degrees - 360 : degrees;
        rewindFrom.current = atHome ? 0 : from;
      },
    }),
    [],
  );

  useLayoutEffect(() => {
    const from = rewindFrom.current;
    rewindFrom.current = null;
    const element = hand.current;
    if (!atStart || from === null || !element) return;
    element.style.setProperty('--rewind-from', from + 'deg');
    const durationMs = from === 0 ? 0 : Math.round(240 + Math.abs(from) * 1.2);
    element.style.setProperty('--rewind-duration', durationMs + 'ms');
    element.classList.add('dial-rewinding');
    return () => element.classList.remove('dial-rewinding');
  }, [atStart, span, phase]);

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
