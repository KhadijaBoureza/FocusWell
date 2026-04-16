import { createContext, useContext, useEffect, useRef, useState } from "react";

type Mode = "work" | "shortBreak" | "longBreak";

interface TimerState {
  mode: Mode;
  activeMode: Mode | null;
  timeLeft: number;
  isRunning: boolean;
  isAlarmPlaying: boolean;
  setMode: (m: Mode) => void;
  setTimeLeft: (t: number) => void;
  setIsRunning: (r: boolean) => void;
  setActiveMode: (m: Mode | null) => void;
  dismissAlarm: () => void;
}

const TimerContext = createContext<TimerState | null>(null);

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<Mode>("work");
  const [activeMode, setActiveMode] = useState<Mode | null>(null);

  const [timeLeftByMode, setTimeLeftByMode] = useState({
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

  const startRef = useRef<number | null>(null);
  const baseTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const timeLeft = timeLeftByMode[mode];

  const setTimeLeft = (value: number) => {
    setTimeLeftByMode((prev) => ({
      ...prev,
      [mode]: value,
    }));
  };

  useEffect(() => {
    const audio = new Audio("/notification.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;

    const unlockAudio = () => {
      audio.muted = true;
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
        })
        .catch(() => {});
      document.removeEventListener("click", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);

    return () => {
      document.removeEventListener("click", unlockAudio);
      audio.pause();
      audio.currentTime = 0;
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let rafId: number;

    if (!isRunning || !activeMode) return;

    startRef.current = Date.now();
    baseTimeRef.current = timeLeftByMode[activeMode];

    const tick = () => {
      if (!startRef.current) return;

      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      const newTime = Math.max(0, baseTimeRef.current - elapsed);

      setTimeLeftByMode((prev) => ({
        ...prev,
        [activeMode]: newTime,
      }));

      if (newTime > 0) {
        rafId = requestAnimationFrame(tick);
      } else {
        setIsRunning(false);
        setIsAlarmPlaying(true);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [isRunning, activeMode]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isAlarmPlaying) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isAlarmPlaying]);

  const dismissAlarm = () => {
    setIsAlarmPlaying(false);
  };

  return (
    <TimerContext.Provider
      value={{
        mode,
        activeMode,
        timeLeft,
        isRunning,
        isAlarmPlaying,
        setMode,
        setTimeLeft,
        setIsRunning,
        setActiveMode,
        dismissAlarm,
      }}
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