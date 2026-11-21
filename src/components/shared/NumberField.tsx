import { useState } from 'react';

type Props = {
  label: string;
  unit?: string;
  value: number;
  min: number;
  step?: number | 'any';
  disabled: boolean;
  onChange: (value: number) => void;
};

export function NumberField({ label, unit, value, min, step = 1, disabled, onChange }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <label className="number-field">
      <span>{label}</span>
      <span className="input-shell">
        <input
          type="number"
          min={min}
          step={step}
          disabled={disabled}
          value={draft ?? value}
          inputMode={step === 'any' ? 'decimal' : 'numeric'}
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
        {unit && <span className="unit">{unit}</span>}
      </span>
    </label>
  );
}
