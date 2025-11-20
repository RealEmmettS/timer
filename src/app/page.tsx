'use client';

import InteractiveGridBackground from "@/components/InteractiveGridBackground";
import { ModeSwitcher } from "@/components/shared/ModeSwitcher";
import CountdownView from "@/components/modes/CountdownView";
import StopwatchView from "@/components/modes/StopwatchView";
import IntervalView from "@/components/modes/IntervalView";
import { useTimer } from "@/context/TimerContext";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { MotionButton } from "@/components/shared/MotionButton";

export default function Home() {
  const { activeMode, setActiveMode } = useTimer();
  const [isDark, setIsDark] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Toggle dark mode
  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.code === 'Space') {
         // Global start/pause - tricky without access to specific engine
         // But we can dispatch an event or access context if we were inside a component using the engine.
         // Here we are at the top level.
         // Ideally, context exposes a global toggleActiveTimer()
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Render active view
  const renderView = () => {
    switch (activeMode) {
      case 'countdown': return <CountdownView />;
      case 'stopwatch': return <StopwatchView />;
      case 'interval': return <IntervalView />;
      default: return <CountdownView />;
    }
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col overflow-hidden bg-transparent transition-colors duration-300">
      <InteractiveGridBackground />
      
      {/* Header */}
      <header className="relative z-10 w-full p-4 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
            <h1 className="font-mono font-bold text-xl tracking-tighter uppercase">
            Bauhaus<span className="text-bauhaus-red">.</span>Timer
            </h1>
            {/* Mobile controls show here */}
            <div className="flex md:hidden items-center gap-2">
                <MotionButton variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </MotionButton>
                <MotionButton variant="ghost" size="sm" onClick={() => setIsDark(!isDark)}>
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </MotionButton>
            </div>
        </div>
        
        <div className="w-full md:w-auto flex justify-center">
           <ModeSwitcher activeMode={activeMode} onChange={setActiveMode} />
        </div>
        
        <div className="hidden md:flex items-center gap-2">
           <MotionButton variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? "Mute" : "Unmute"}>
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
           </MotionButton>
           <MotionButton variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} title={isDark ? "Light Mode" : "Dark Mode"}>
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
           </MotionButton>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMode}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="w-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 p-6 text-center opacity-40 font-mono text-[10px] uppercase tracking-widest hidden md:block">
         <p>Designed with Bauhaus Principles • Precision Timing</p>
      </footer>
    </main>
  );
}
