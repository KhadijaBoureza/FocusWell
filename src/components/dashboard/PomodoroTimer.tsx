import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, SkipForward } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const MODES = {
  work: { label: "Focus", duration: 25 * 60 },
  shortBreak: { label: "Short Break", duration: 5 * 60 },
  longBreak: { label: "Long Break", duration: 15 * 60 },
};

type Mode = keyof typeof MODES;

interface SessionLog {
  date: string;
  sessions: number;
  totalMinutes: number;
}

function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [isRunning, setIsRunning] = useState(false);

  const [sessions, setSessions] = useLocalStorage<number>(
    "focuswell-pomodoro-sessions",
    0
  );

  const [todayMinutes, setTodayMinutes] = useLocalStorage<number>(
    "focuswell-today-minutes",
    0
  );

  const [sessionLog, setSessionLog] = useLocalStorage<SessionLog[]>(
    "focuswell-session-log",
    []
  );

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0) {
      setIsRunning(false);

      if (mode === "work") {
        setSessions((s) => s + 1);
        setTodayMinutes((m) => m + 25);

        const today = new Date().toISOString().split("T")[0];

        setSessionLog((logs) => {
          const existing = logs.find((l) => l.date === today);

          if (existing) {
            return logs.map((l) =>
              l.date === today
                ? {
                    ...l,
                    sessions: l.sessions + 1,
                    totalMinutes: l.totalMinutes + 25,
                  }
                : l
            );
          }

          return [...logs, { date: today, sessions: 1, totalMinutes: 25 }];
        });
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, mode]);

  function switchMode(newMode: Mode) {
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
    setIsRunning(false);
  }

  function resetTimer() {
    setTimeLeft(MODES[mode].duration);
    setIsRunning(false);
  }

  function skipToNext() {
    if (mode === "work") {
      switchMode(sessions % 4 === 3 ? "longBreak" : "shortBreak");
    } else {
      switchMode("work");
    }
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const progress = 1 - timeLeft / MODES[mode].duration;
  const circumference = 2 * Math.PI * 90;

  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-4">Focus Timer</h2>

      {/* Mode Switch */}
      <div className="flex gap-2 mb-6">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-3 py-1.5 rounded-md text-xs transition ${
              mode === m
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative w-52 h-52 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="hsl(var(--border))"
            strokeWidth="6"
            fill="none"
          />

          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className="transition-all duration-1000"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-primary">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>

          <span className="text-xs text-muted-foreground mt-2">
            {MODES[mode].label}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="p-3.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition"
        >
          {isRunning ? <Pause size={22} /> : <Play size={22} />}
        </button>

        <button
          onClick={resetTimer}
          className="p-3.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition"
        >
          <RotateCcw size={22} />
        </button>

        <button
          onClick={skipToNext}
          className="p-3.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition"
        >
          <SkipForward size={22} />
        </button>
      </div>

      {/* Session Info */}
      <div className="flex items-center gap-4 mt-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Coffee size={14} />
          <span>{sessions} sessions</span>
        </div>

        <span className="text-border">|</span>

        <span>{todayMinutes} min today</span>
      </div>
    </div>
  );
}

export default PomodoroTimer;