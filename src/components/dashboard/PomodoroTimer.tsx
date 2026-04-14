import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  SkipForward,
  BellOff,
  Settings,
  Plus,
  Minus,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";

const DEFAULT_DURATIONS = { work: 25, shortBreak: 5, longBreak: 15 };

type Mode = "work" | "shortBreak" | "longBreak";

const MODE_LABELS: Record<Mode, string> = {
  work: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

const modeColors: Record<
  Mode,
  { stroke: string; text: string; filter: string }
> = {
  work: {
    stroke: "hsl(var(--primary))",
    text: "text-primary",
    filter: "hsl(var(--primary) / 0.5)",
  },
  shortBreak: {
    stroke: "hsl(var(--accent))",
    text: "text-accent",
    filter: "hsl(var(--accent) / 0.5)",
  },
  longBreak: {
    stroke: "hsl(var(--secondary))",
    text: "text-secondary",
    filter: "hsl(var(--secondary) / 0.5)",
  },
};

interface SessionLog {
  date: string;
  sessions: number;
  totalMinutes: number;
}

const PomodoroTimer = () => {
  const [durations, setDurations] = useLocalStorage(
    "focuswell-durations",
    DEFAULT_DURATIONS
  );

  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(durations.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempDurations, setTempDurations] = useState(durations);

  // ✅ OLD localStorage stats
  // const [sessions, setSessions] = useLocalStorage("focuswell-pomodoro-sessions", 0);
  // const [todayMinutes, setTodayMinutes] = useLocalStorage("focuswell-today-minutes", 0);
  // const [sessionLog, setSessionLog] = useLocalStorage<SessionLog[]>("focuswell-session-log", []);
  // const [breaks, setBreaks] = useLocalStorage("focuswell-pomodoro-breaks", 0);

  // ✅ NEW backend-driven stats
  const [sessions, setSessions] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [sessionLog, setSessionLog] = useState<SessionLog[]>([]);
  const [breaks, setBreaks] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadFromBackend = async () => {
      try {
        const data = await api.getPomodoro();

        if (!data) return;

        if (data.durations) {
          setDurations(data.durations);
          setTempDurations(data.durations);
        }

        if (Array.isArray(data.sessions)) {
          const workSessions = data.sessions.filter((s: any) => s.mode === "work");
          setSessions(workSessions.length);
        }

        if (typeof data.todayMinutes === "number") {
          setTodayMinutes(data.todayMinutes);
        }

        if (typeof data.breaks === "number") {
          setBreaks(data.breaks);
        }

        if (Array.isArray(data.sessionLog)) {
          setSessionLog(data.sessionLog);
        }

        if (data.durations?.[mode]) {
          setTimeLeft(data.durations[mode] * 60);
        }

        console.log("Loaded from backend ✅");
      } catch (err) {
        console.log("Backend load failed", err);
      }
    };

    loadFromBackend();
  }, [mode, setDurations]);

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
    };
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

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
  }, [isRunning, timeLeft, playSound]);

  useEffect(() => {
    if (timeLeft !== 0 || isRunning) return;

    const now = new Date().toISOString();

    if (mode === "work") {
      const focusMinutes = durations.work;

      setSessions((s) => s + 1);
      setTodayMinutes((m) => m + focusMinutes);

      const today = now.split("T")[0];
      setSessionLog((logs) => {
        const existing = logs.find((l) => l.date === today);

        if (existing) {
          return logs.map((l) =>
            l.date === today
              ? {
                  ...l,
                  sessions: l.sessions + 1,
                  totalMinutes: l.totalMinutes + focusMinutes,
                }
              : l
          );
        }

        return [
          ...logs,
          { date: today, sessions: 1, totalMinutes: focusMinutes },
        ];
      });

      api.saveSession({
        mode: "work",
        duration: durations.work,
        completedAt: now,
      });
    } else {
      setBreaks((b) => b + 1);

      api.saveSession({
        mode,
        duration: durations[mode],
        completedAt: now,
      });
    }
  }, [timeLeft, isRunning, mode, durations]);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(durations[newMode] * 60);
    setIsRunning(false);
    setIsFinished(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const reset = () => {
    setTimeLeft(durations[mode] * 60);
    setIsRunning(false);
    setIsFinished(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const skipToNext = () => {
    if (mode === "work") switchMode("shortBreak");
    else if (mode === "shortBreak") switchMode("longBreak");
    else switchMode("work");
  };

  const adjustDuration = (
    key: keyof typeof DEFAULT_DURATIONS,
    delta: number
  ) => {
    setTempDurations((prev) => ({
      ...prev,
      [key]: Math.max(1, Math.min(120, prev[key] + delta)),
    }));
  };

  const saveDurations = () => {
    setDurations(tempDurations);
    setTimeLeft(tempDurations[mode] * 60);
    setIsRunning(false);
    setIsFinished(false);
    setSettingsOpen(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / (durations[mode] * 60);
  const circumference = 2 * Math.PI * 90;

  const finishedColor = {
    stroke: "hsl(var(--destructive))",
    text: "text-destructive",
    filter: "hsl(var(--destructive) / 0.5)",
  };

  const colors = isFinished ? finishedColor : modeColors[mode];

  return (
    <div className="glass-card neon-border-violet flex flex-col items-center p-6">
      <div className="mb-4 flex w-full items-center justify-between">
        <Dialog
          open={settingsOpen}
          onOpenChange={(open) => {
            setSettingsOpen(open);
            if (open) setTempDurations(durations);
          }}
        >
          <DialogTrigger asChild>
            <button className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground">
              <Settings size={18} />
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-mono">Timer Settings</DialogTitle>
            </DialogHeader>

            <div className="mt-2 space-y-4">
              {(["work", "shortBreak", "longBreak"] as const).map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">
                    {MODE_LABELS[key]}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjustDuration(key, -5)}
                      className="rounded-md bg-muted p-1.5 text-foreground transition-all hover:bg-muted/80"
                    >
                      <Minus size={14} />
                    </button>

                    <span className="w-12 text-center font-mono text-sm text-foreground">
                      {tempDurations[key]} min
                    </span>

                    <button
                      onClick={() => adjustDuration(key, 5)}
                      className="rounded-md bg-muted p-1.5 text-foreground transition-all hover:bg-muted/80"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={saveDurations}
                className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <h2 className="font-mono text-lg font-semibold text-foreground">
          Focus Timer
        </h2>

        {isFinished ? (
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              reset();
            }}
            className="animate-pulse rounded-lg p-1.5 text-destructive transition-all hover:bg-destructive/15"
          >
            <BellOff size={18} />
          </button>
        ) : (
          <div className="w-[30px]" />
        )}
      </div>

      <div className="mb-6 flex gap-2">
        {(["work", "shortBreak", "longBreak"] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all ${
              mode === m
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <div className="relative mb-6 h-52 w-52">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="hsl(var(--chart-track))"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke={colors.stroke}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className="transition-all duration-300"
            style={{ filter: `drop-shadow(0 0 8px ${colors.filter})` }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-mono text-5xl font-bold ${colors.text} ${
              isFinished ? "animate-pulse" : ""
            }`}
          >
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>
          <span className="mt-2 text-xs text-muted-foreground">
            {MODE_LABELS[mode]}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="rounded-full bg-primary/15 p-3.5 text-primary transition-all hover:bg-primary/25"
        >
          {isRunning ? <Pause size={22} /> : <Play size={22} />}
        </button>

        <button
          onClick={reset}
          className="rounded-full bg-muted p-3.5 text-muted-foreground transition-all hover:text-foreground"
        >
          <RotateCcw size={22} />
        </button>

        <button
          onClick={skipToNext}
          className="rounded-full bg-muted p-3.5 text-muted-foreground transition-all hover:text-foreground"
        >
          <SkipForward size={22} />
        </button>
      </div>

      <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Coffee size={14} />
          <span>{sessions} sessions</span>
        </div>
        <span className="text-border">|</span>
        <span>{breaks} breaks</span>
        <span className="text-border">|</span>
        <span>{todayMinutes} min today</span>
      </div>
    </div>
  );
};

export default PomodoroTimer;