import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const MODES = {
  work: { label: "Focus", duration: 25 * 60 },
  shortBreak: { label: "Short Break", duration: 5 * 60 },
  longBreak: { label: "Long Break", duration: 15 * 60 },
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
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useLocalStorage("focuswell-sound-enabled", true);
  const [sessions, setSessions] = useLocalStorage("focuswell-pomodoro-sessions", 0);
  const [todayMinutes, setTodayMinutes] = useLocalStorage("focuswell-today-minutes", 0);
  const [sessionLog, setSessionLog] = useLocalStorage<SessionLog[]>("focuswell-session-log", []);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (soundEnabled) {
        audioRef.current?.play().catch(() => console.log("Audio blocked"));
      }
      if (mode === "work") {
        setSessions((s) => s + 1);
        setTodayMinutes((m) => m + 25);
        const today = new Date().toISOString().split("T")[0];
        setSessionLog((logs) => {
          const existing = logs.find((l) => l.date === today);
          if (existing) {
            return logs.map((l) => l.date === today ? { ...l, sessions: l.sessions + 1, totalMinutes: l.totalMinutes + 25 } : l);
          }
          return [...logs, { date: today, sessions: 1, totalMinutes: 25 }];
        });
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft, mode, soundEnabled]);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
    setIsRunning(false);
  };

  const reset = () => { setTimeLeft(MODES[mode].duration); setIsRunning(false); };

  const skipToNext = () => {
    if (mode === "work") {
      switchMode(sessions % 4 === 3 ? "longBreak" : "shortBreak");
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
            setSoundEnabled(!soundEnabled);
            // stop sound immediately
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }}
          className={`p-1.5 rounded-lg transition-all ${soundEnabled ? "text-primary hover:bg-primary/15" : "text-muted-foreground hover:bg-muted/50"
            }`}
          title={soundEnabled ? "Sound on" : "Sound off"}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${mode === m ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      <div className="relative w-52 h-52 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" stroke="hsl(var(--chart-track))" strokeWidth="6" fill="none" />
          <circle
            cx="100" cy="100" r="90"
            stroke={colors.stroke}
            strokeWidth="6" fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className="transition-all duration-1000"
            style={{ filter: `drop-shadow(0 0 8px ${colors.filter})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono text-5xl font-bold ${colors.text}`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground mt-2">{MODES[mode].label}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setIsRunning(!isRunning)} className="p-3.5 rounded-full bg-primary/15 text-primary hover:bg-primary/25 transition-all">
          {isRunning ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <button onClick={reset} className="p-3.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-all">
          <RotateCcw size={22} />
        </button>
        <button onClick={skipToNext} className="p-3.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-all">
          <SkipForward size={22} />
        </button>
      </div>

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
};

export default PomodoroTimer;