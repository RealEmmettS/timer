import { Hourglass, Repeat2, Timer } from 'lucide-react';
import { hapticSelection } from '@/utils/haptics';

const modes = [
  { id: 'countdown', label: 'Countdown', icon: Hourglass },
  { id: 'stopwatch', label: 'Stopwatch', icon: Timer },
  { id: 'interval', label: 'Interval', icon: Repeat2 },
] as const;
export type Mode = (typeof modes)[number]['id'];

export function ModeSwitcher({ activeMode, onChange }: { activeMode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div className="mode-bar" role="group" aria-label="Timer mode">
      {modes.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={id === activeMode}
          onClick={() => {
            if (id !== activeMode) {
              hapticSelection();
              onChange(id);
            }
          }}
        >
          <Icon aria-hidden="true" size={17} />
          {label}
        </button>
      ))}
    </div>
  );
}
