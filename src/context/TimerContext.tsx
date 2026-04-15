import { createContext, useContext, useState, useEffect, useRef } from "react";

type Mode = "work" | "shortBreak" | "longBreak";

interface TimerState {
  mode: Mode;
  timeLeft: number;
  isRunning: boolean;
  setMode: (m: Mode) => void;
  setTimeLeft: (t: number) => void;
  setIsRunning: (r: boolean) => void;
}

const TimerContext = createContext<TimerState | null>(null);

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const startRef = useRef<number | null>(null);
  const baseTimeRef = useRef<number>(timeLeft);

  useEffect(() => {
  let rafId: number;

  if (!isRunning) return;

  startRef.current = Date.now();
  baseTimeRef.current = timeLeft;

  const tick = () => {
    if (!startRef.current) return;

    const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
    const newTime = Math.max(0, baseTimeRef.current - elapsed);

    setTimeLeft(newTime);

    if (newTime > 0) {
      rafId = requestAnimationFrame(tick);
    } else {
      setIsRunning(false);
    }
  };

  rafId = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(rafId);
}, [isRunning]);

  return (
    <TimerContext.Provider
      value={{ mode, timeLeft, isRunning, setMode, setTimeLeft, setIsRunning }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used inside TimerProvider");
  return ctx;
};