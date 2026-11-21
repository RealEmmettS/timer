'use client';

import { createElement, useState } from 'react';
import { Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { ModeSwitcher, type Mode } from '@/components/shared/ModeSwitcher';
import { DurationUnitProvider } from '@/components/shared/DurationField';
import CountdownView from '@/components/modes/CountdownView';
import StopwatchView from '@/components/modes/StopwatchView';
import IntervalView from '@/components/modes/IntervalView';
import InteractiveGridBackground from '@/components/InteractiveGridBackground';
import { prepareAudio } from '@/utils/audio';
import { hapticSelection } from '@/utils/haptics';

export default function Home() {
  const [mode, setMode] = useState<Mode>('countdown');
  const [sound, setSound] = useState(true);

  function toggleTheme() {
    hapticSelection();
    const root = document.documentElement;
    const current =
      root.dataset.theme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    root.dataset.theme = current === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('timer-theme', root.dataset.theme);
    } catch {
      /* Storage is optional. */
    }
  }
  return (
    <main className="workspace">
      <InteractiveGridBackground />
      <header className="masthead">
        <div className="masthead-inner">
          <h1 className="masthead-title">
            {createElement('shaughv-mark', { 'data-static': '', 'aria-label': 'SHAUGHV', role: 'img' })}
            <span className="mast-divider" aria-hidden="true" />
            Timer
          </h1>
          <div className="tools">
            <button
              type="button"
              aria-label="Timer sounds"
              aria-pressed={sound}
              title={sound ? 'Mute timer sounds' : 'Enable timer sounds'}
              onClick={() => {
                hapticSelection();
                if (!sound) prepareAudio();
                setSound(!sound);
              }}
            >
              {sound ? <Volume2 /> : <VolumeX />}
            </button>
            <button
              type="button"
              aria-label="Switch color theme"
              title="Switch color theme"
              onClick={toggleTheme}
            >
              <Sun className="sun" />
              <Moon className="moon" />
            </button>
          </div>
        </div>
      </header>
      <div className="workbench">
        <ModeSwitcher activeMode={mode} onChange={setMode} />
        <DurationUnitProvider>
          <CountdownView active={mode === 'countdown'} sound={sound} />
          <StopwatchView active={mode === 'stopwatch'} />
          <IntervalView active={mode === 'interval'} sound={sound} />
        </DurationUnitProvider>
      </div>
    </main>
  );
}
