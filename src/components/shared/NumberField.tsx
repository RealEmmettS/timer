import { useId, useState, type ReactNode } from 'react';

type Props = {
  label: string;
  unit?: string;
  value: number;
  min: number;
  step?: number | 'any';
  disabled: boolean;
  onChange: (value: number) => void;
  onFocus?: () => void;
  children?: ReactNode;
};

export function NumberField({
  label,
  unit,
  value,
  min,
  step = 1,
  disabled,
  onChange,
  onFocus,
  children,
}: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const id = useId();
  return (
    <div className="number-field">
      <label className="setting-label" htmlFor={id}>
        {label}
        {unit && <span className="sr-only"> {unit}</span>}
      </label>
      <div className="input-shell">
        <input
          id={id}
          type="number"
          min={min}
          step={step}
          disabled={disabled}
          value={draft ?? value}
          inputMode={step === 'any' ? 'decimal' : 'numeric'}
          onFocus={onFocus}
          onChange={(event) => {
            const input = event.currentTarget;
            setDraft(input.value);
            if (
              input.validity.valid &&
              Number.isFinite(input.valueAsNumber) &&
              Number.isSafeInteger(Math.round(input.valueAsNumber * 60000))
            )
              onChange(input.valueAsNumber);
          }}
          onBlur={() => setDraft(null)}
        />
        {children ??
          (unit && (
            <span className="unit" aria-hidden="true">
              {unit}
            </span>
          ))}
      </div>
    </div>
  );
}
