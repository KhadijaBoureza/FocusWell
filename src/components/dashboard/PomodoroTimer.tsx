import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Coffee, SkipForward, BellOff, Settings, Plus, Minus } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/lib/api";

const DEFAULT_DURATIONS = { work: 25, shortBreak: 5, longBreak: 15 };

type Mode = "work" | "shortBreak" | "longBreak";

const MODE_LABELS: Record<Mode, string> = {
  work: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

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
  const [durations, setDurations] = useLocalStorage("focuswell-durations", DEFAULT_DURATIONS);
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(durations.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempDurations, setTempDurations] = useState(durations);

  const [sessions, setSessions] = useLocalStorage("focuswell-pomodoro-sessions", 0);
  const [todayMinutes, setTodayMinutes] = useLocalStorage("focuswell-today-minutes", 0);
  const [sessionLog, setSessionLog] = useLocalStorage<SessionLog[]>("focuswell-session-log", []);

  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadFromBackend = async () => {
      try {
        const data = await api.getTimer();

        if (!data) return;

        // safely update state
        if (data.durations) setDurations(data.durations);
        if (data.sessions) setSessions(data.sessions);
        if (data.todayMinutes) setTodayMinutes(data.todayMinutes);
        if (data.sessionLog) setSessionLog(data.sessionLog);

        // sync timer with backend durations
        if (data.durations?.[mode]) {
          setTimeLeft(data.durations[mode] * 60);
        }

        console.log("Loaded from backend ✅");
      } catch {
        console.log("Using localStorage fallback ⚡");
      }
    };

    loadFromBackend();
  }, []);

  // INIT AUDIO
  useEffect(() => {
    const audio = new Audio("/notification.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;

    const unlockAudio = () => {
      audio.muted = true;
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      }).catch(() => { });
      document.removeEventListener("click", unlockAudio);
    };
    document.addEventListener("click", unlockAudio);
  }, []);

  // Play sound immediately via callback
  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = -1;
      audioRef.current.play().catch(() => { });
    }
  }, []);

  // TIMER LOOP - uses requestAnimationFrame + Date.now for accuracy
  useEffect(() => {
    if (!isRunning) return;

    const startTime = Date.now();
    const startValue = timeLeft;
    let rafId: number;

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const newTime = Math.max(0, startValue - elapsed);

      setTimeLeft(newTime);

      if (newTime === 0) {
        setIsRunning(false);
        setIsFinished(true);
        playSound();
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [isRunning, playSound]);

  // WHEN TIMER ENDS - update stats
  useEffect(() => {
    if (timeLeft !== 0 || isRunning) return;

    if (mode === "work") {
      const focusMinutes = durations.work;
      setSessions((s) => s + 1);
      setTodayMinutes((m) => m + focusMinutes);

      const today = new Date().toISOString().split("T")[0];
      setSessionLog((logs) => {
        const existing = logs.find((l) => l.date === today);
        if (existing) {
          return logs.map((l) =>
            l.date === today
              ? { ...l, sessions: l.sessions + 1, totalMinutes: l.totalMinutes + focusMinutes }
              : l
          );
        }
        return [...logs, { date: today, sessions: 1, totalMinutes: focusMinutes }];
      });
      api.saveSession({
        mode: "work",
        duration: durations.work,
        completedAt: new Date().toISOString(),
      });
    }
  }, [timeLeft, isRunning]);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(durations[newMode] * 60);
    setIsRunning(false);
    setIsFinished(false);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
  };

  const reset = () => {
    setTimeLeft(durations[mode] * 60);
    setIsRunning(false);
    setIsFinished(false);

    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
  };

  const skipToNext = () => {
    if (mode === "work") switchMode("shortBreak");
    else if (mode === "shortBreak") switchMode("longBreak");
    else switchMode("work");
  };

  const adjustDuration = (key: keyof typeof DEFAULT_DURATIONS, delta: number) => {
    setTempDurations((prev) => ({
      ...prev,
      [key]: Math.max(1, Math.min(120, prev[key] + delta)),
    }));
  };

  const saveDurations = () => {
    setDurations(tempDurations);
    // Reset current timer to new duration
    setTimeLeft(tempDurations[mode] * 60);
    setIsRunning(false);
    setIsFinished(false);
    setSettingsOpen(false);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / (durations[mode] * 60);
  const circumference = 2 * Math.PI * 90;
  const finishedColor = { stroke: "hsl(var(--destructive))", text: "text-destructive", filter: "hsl(var(--destructive) / 0.5)" };
  const colors = isFinished ? finishedColor : modeColors[mode];

  return (
    <div className="glass-card neon-border-violet p-6 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        {/* Settings button */}
        <Dialog open={settingsOpen} onOpenChange={(open) => { setSettingsOpen(open); if (open) setTempDurations(durations); }}>
          <DialogTrigger asChild>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
              <Settings size={18} />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-mono">Timer Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {(["work", "shortBreak", "longBreak"] as const).map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{MODE_LABELS[key]}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjustDuration(key, -5)}
                      className="p-1.5 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-all"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-mono text-sm w-12 text-center text-foreground">{tempDurations[key]} min</span>
                    <button
                      onClick={() => adjustDuration(key, 5)}
                      className="p-1.5 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={saveDurations}
                className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
              >
                Save
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <h2 className="font-mono text-lg font-semibold text-foreground">Focus Timer</h2>

        {isFinished ? (
          <button
            onClick={() => {
              if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
              reset();
            }}
            className="p-1.5 rounded-lg text-destructive hover:bg-destructive/15 transition-all animate-pulse"
          >
            <BellOff size={18} />
          </button>
        ) : (
          <div className="w-[30px]" />
        )}
      </div>

      {/* MODES */}
      <div className="flex gap-2 mb-6">
        {(["work", "shortBreak", "longBreak"] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${mode === m ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* TIMER */}
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
            className="transition-all duration-300"
            style={{ filter: `drop-shadow(0 0 8px ${colors.filter})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono text-5xl font-bold ${colors.text} ${isFinished ? "animate-pulse" : ""}`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground mt-2">{MODE_LABELS[mode]}</span>
        </div>
      </div>

      {/* CONTROLS */}
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

      {/* STATS */}
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