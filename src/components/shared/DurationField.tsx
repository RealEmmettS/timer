import Script from 'next/script';
import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';

const unitMs = { sec: 1000, min: 60000, hr: 3600000 };
type Unit = keyof typeof unitMs;
export type Duration = { amount: number; unit: Unit };

export function toMilliseconds({ amount, unit }: Duration) {
  return Math.round(amount * unitMs[unit]);
}

function parseDuration(text: string, selectedUnit: Unit, minMs: number): Duration | null {
  const match =
    /^(\+?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*(s|secs?|seconds?|m|mins?|minutes?|h|hrs?|hours?)?$/i.exec(
      text.trim(),
    );
  if (!match) return null;
  const suffix = match[2]?.[0].toLowerCase();
  const unit = suffix === 's' ? 'sec' : suffix === 'm' ? 'min' : suffix === 'h' ? 'hr' : selectedUnit;
  const duration = { amount: Number(match[1]), unit };
  return duration.amount >= minMs / unitMs[unit] && Number.isSafeInteger(toMilliseconds(duration))
    ? duration
    : null;
}

type Dropdown = { refresh(): void; destroy(): void };
declare global {
  interface Window {
    ShaughvDropdown?: { enhance: (select: HTMLSelectElement) => Dropdown | null };
  }
}

const UnitScriptReady = createContext(false);

export function DurationUnitProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  return (
    <UnitScriptReady.Provider value={ready}>
      {children}
      <Script
        src="https://cdn.shaughv.com/js/shaughv-dropdown.js?v=2026-10-21.2"
        onReady={() => setReady(true)}
      />
    </UnitScriptReady.Provider>
  );
}

type Props = {
  label: string;
  duration: Duration;
  minMs?: number;
  disabled: boolean;
  onChange: (duration: Duration) => void;
  onPreview?: () => void;
};

export function DurationField({ label, duration, minMs = 0, disabled, onChange, onPreview }: Props) {
  const { amount, unit } = duration;
  const [draft, setDraft] = useState<string | null>(null);
  const id = useId();
  const select = useRef<HTMLSelectElement>(null);
  const dropdown = useRef<Dropdown | null>(null);
  const ready = useContext(UnitScriptReady);

  useEffect(() => {
    if (!ready || !select.current) return;
    dropdown.current = window.ShaughvDropdown?.enhance(select.current) ?? null;
    return () => {
      dropdown.current?.destroy();
      dropdown.current = null;
    };
  }, [ready]);

  // A suffix typed into the amount changes the native select without a select change event.
  useEffect(() => {
    dropdown.current?.refresh();
  }, [unit]);

  function change(next: Duration) {
    if (!Number.isSafeInteger(toMilliseconds(next))) return;
    onPreview?.();
    onChange(next);
  }

  return (
    <div className="number-field">
      <label className="setting-label" htmlFor={id}>
        {label}
        <span className="sr-only"> {unit}</span>
      </label>
      <div className="input-shell duration-shell">
        <input
          id={id}
          className="duration-amount"
          type="text"
          role="spinbutton"
          inputMode="text"
          enterKeyHint="done"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          aria-valuemin={minMs / unitMs[unit]}
          aria-valuenow={amount}
          aria-valuetext={amount + ' ' + unit}
          value={draft ?? amount}
          onFocus={onPreview}
          onChange={(event) => {
            const text = event.currentTarget.value;
            setDraft(text);
            const next = parseDuration(text, unit, minMs);
            if (next) change(next);
          }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === 'Enter') {
              event.preventDefault();
              setDraft(null);
            } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
              event.preventDefault();
              setDraft(null);
              change({
                amount: Math.max(minMs / unitMs[unit], amount + (event.key === 'ArrowUp' ? 1 : -1)),
                unit,
              });
            }
          }}
          onBlur={() => setDraft(null)}
        />
        <span className="unit-picker" onFocus={onPreview}>
          <select
            ref={select}
            aria-label={label + ' time unit'}
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
      </div>
    </div>
  );
}
