import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const MODES = {
  work: { label: "Focus", duration: 1 * 60 },
  shortBreak: { label: "Short Break", duration: 60 }, // 1 min for testing
  longBreak: { label: "Long Break", duration: 1 * 60 },
};

type Mode = keyof typeof MODES;

const modeColors: Record<Mode, { stroke: string; text: string; filter: string }> = {
  work: { stroke: "hsl(var(--primary))", text: "text-primary", filter: "hsl(var(--primary) / 0.5)" },
  shortBreak: { stroke: "hsl(var(--accent))", text: "text-accent", filter: "hsl(var(--accent) / 0.5)" },
  longBreak: { stroke: "hsl(var(--secondary))", text: "text-secondary", filter: "hsl(var(--secondary) / 0.5)" },
};


interface SessionLog {
  date: string;
  sessions: number;
  totalMinutes: number;
}

const PomodoroTimer = () => {
  const [isFinished, setIsFinished] = useState(false);
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [isRunning, setIsRunning] = useState(false);

  const [soundEnabled, setSoundEnabled] = useLocalStorage("focuswell-sound-enabled", true);
  const [sessions, setSessions] = useLocalStorage("focuswell-pomodoro-sessions", 0);
  const [todayMinutes, setTodayMinutes] = useLocalStorage("focuswell-today-minutes", 0);
  const [sessionLog, setSessionLog] = useLocalStorage<SessionLog[]>("focuswell-session-log", []);

  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // INIT AUDIO
  // useEffect(() => {
  //   audioRef.current = new Audio("/notification.mp3");
  // }, []);

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.loop = true;
  }, []);

  // TIMER LOOP
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // WHEN TIMER ENDS
  useEffect(() => {
    if (timeLeft !== 0) return;

    setIsRunning(false);

    //  play sound FIRST
    if (soundEnabled) {
      audioRef.current?.play()
        .then(() => {
          setIsFinished(true); // start blink AFTER sound starts
        })
        .catch(() => {
          setIsFinished(true); // fallback (no delay)
        });
    } else {
      setIsFinished(true);
    }

    //  ONLY update stats (NO mode switching)
    if (mode === "work") {
      setSessions((s) => s + 1);
      setTodayMinutes((m) => m + 25);

      const today = new Date().toISOString().split("T")[0];

      setSessionLog((logs) => {
        const existing = logs.find((l) => l.date === today);

        if (existing) {
          return logs.map((l) =>
            l.date === today
              ? { ...l, sessions: l.sessions + 1, totalMinutes: l.totalMinutes + 25 }
              : l
          );
        }

        return [...logs, { date: today, sessions: 1, totalMinutes: 25 }];
      });
    }

  }, [timeLeft]);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
    setIsRunning(false);
    setIsFinished(false);
  };

  const reset = () => {
    setTimeLeft(MODES[mode].duration);
    setIsRunning(false);
    setIsFinished(false);
  };

  const skipToNext = () => {
    if (mode === "work") {
      switchMode("shortBreak");
    } else if (mode === "shortBreak") {
      switchMode("longBreak");
    } else {
      switchMode("work");
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / MODES[mode].duration;
  const circumference = 2 * Math.PI * 90;
  const colors = modeColors[mode];

  return (
    <div className="glass-card neon-border-violet p-6 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="w-8" />
        <h2 className="font-mono text-lg font-semibold text-foreground">Focus Timer</h2>

        <button
          onClick={() => {
            const newState = !soundEnabled;
            setSoundEnabled(newState);

            // stop sound
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }

            //stop blinking + reset timer ONLY when turning OFF sound
            if (!newState) {
              setTimeLeft(MODES[mode].duration);
              setIsRunning(false);
              setIsFinished(false);
            }
          }}
          className={`p-1.5 rounded-lg transition-all ${soundEnabled
            ? "text-primary hover:bg-primary/15"
            : "text-muted-foreground hover:bg-muted/50"
            }`}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      {/* MODES */}
      <div className="flex gap-2 mb-6">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${mode === m
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* TIMER */}
      <div className="relative w-52 h-52 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" stroke="hsl(var(--chart-track))" strokeWidth="6" fill="none" />
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke={isFinished ? "rgb(239 68 68)" : colors.stroke}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-mono text-5xl font-bold transition-all duration-300 ${isFinished
              ? "text-red-500 animate-pulse"
              : colors.text
              }`}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground mt-2">{MODES[mode].label}</span>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex gap-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="p-3.5 rounded-full bg-primary/15 text-primary"
        >
          {isRunning ? <Pause size={22} /> : <Play size={22} />}
        </button>

        <button onClick={reset} className="p-3.5 rounded-full bg-muted">
          <RotateCcw size={22} />
        </button>

        <button onClick={skipToNext} className="p-3.5 rounded-full bg-muted">
          <SkipForward size={22} />
        </button>
      </div>

      {/* STATS */}
      <div className="flex items-center gap-4 mt-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Coffee size={14} />
          <span>{sessions} sessions</span>
        </div>
        <span>|</span>
        <span>{todayMinutes} min today</span>
      </div>
    </div>
  );
};

export default PomodoroTimer;