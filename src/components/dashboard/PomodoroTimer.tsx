import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useTimer } from "@/context/TimerContext";

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
  const [durations, setDurations] = useState(DEFAULT_DURATIONS);

  const {
    mode,
    activeMode,
    timeLeft,
    duration,
    isRunning,
    isAlarmPlaying,
    setMode,
    setTimeLeft,
    setIsRunning,
    setActiveMode,
    dismissAlarm,
  } = useTimer();

  const isFinished = isAlarmPlaying && activeMode === mode;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempDurations, setTempDurations] = useState(durations);

  const [sessions, setSessions] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [sessionLog, setSessionLog] = useState<SessionLog[]>([]);
  const [breaks, setBreaks] = useState(0);

  useEffect(() => {
    const loadFromBackend = async () => {
      try {
        const data = await api.getPomodoro();
        if (!data) return;

        const loadedDurations = {
          work:
            typeof data?.durations?.work === "number"
              ? data.durations.work
              : DEFAULT_DURATIONS.work,
          shortBreak:
            typeof data?.durations?.shortBreak === "number"
              ? data.durations.shortBreak
              : DEFAULT_DURATIONS.shortBreak,
          longBreak:
            typeof data?.durations?.longBreak === "number"
              ? data.durations.longBreak
              : DEFAULT_DURATIONS.longBreak,
        };

        setDurations(loadedDurations);
        setTempDurations(loadedDurations);

        if (Array.isArray(data.sessions)) {
          const today = new Date().toISOString().split("T")[0];

          const todayWorkSessions = data.sessions.filter(
            (s: any) =>
              s.mode === "work" &&
              String(s.completedAt).startsWith(today)
          );

          setSessions(todayWorkSessions.length);
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

        console.log("Loaded from backend ✅");
      } catch (err) {
        console.log("Backend load failed", err);
      }
    };

    loadFromBackend();
  }, []);

  useEffect(() => {
    if (!isAlarmPlaying || !activeMode) return;

    const now = new Date().toISOString();

    if (activeMode === "work") {
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
        mode: activeMode,
        duration: durations[activeMode],
        completedAt: now,
      });
    }
  }, [isAlarmPlaying, activeMode, durations]);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
  };

  const reset = () => {
    dismissAlarm();

    if (activeMode === mode) {
      setIsRunning(false);
      setActiveMode(null);
    }

    setTimeLeft(durations[mode] * 60);
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
    setTempDurations((prev) => {
      const current = prev[key];
      let next = current;

      if (delta > 0) {
        next = current < 5 ? 5 : current + 5;
      } else {
        if (current <= 5) {
          next = 1;
        } else {
          next = current - 5;
        }
      }

      return {
        ...prev,
        [key]: Math.max(1, Math.min(120, next)),
      };
    });
  };

  const saveDurations = async () => {
    try {
      const saved = await api.saveSettings(tempDurations);

      const cleanDurations = {
        work: saved.work,
        shortBreak: saved.shortBreak,
        longBreak: saved.longBreak,
      };

      setDurations(cleanDurations);
      setTempDurations(cleanDurations);
      setTimeLeft(cleanDurations[mode] * 60);
      setIsRunning(false);
      setSettingsOpen(false);
    } catch (err) {
      console.error("Failed to save settings", err);
    }
  };

  const displayTime = Math.ceil(timeLeft);
  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;

  const totalSeconds = durations[mode] * 60;
const progress = 1 - timeLeft / totalSeconds; 
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  const finishedColor = {
    stroke: "hsl(var(--destructive))",
    text: "text-destructive",
    filter: "hsl(var(--destructive) / 0.5)",
  };

  const colors =
    isAlarmPlaying && activeMode === mode
      ? finishedColor
      : modeColors[mode];

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

        {isAlarmPlaying ? (
          <button
            onClick={() => {
              dismissAlarm();
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
            className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all ${mode === m
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <div className="relative mb-6 h-52 w-52">
  <svg className="h-full w-full" viewBox="0 0 200 200">
    
    {/* Background track */}
    <circle
      cx="100"
      cy="100"
      r="90"
      stroke="hsl(var(--chart-track))"
      strokeWidth="6"
      fill="none"
    />

    {/* Single animated ring (THIS is the fix) */}
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
      transform="rotate(-90 100 100)"
      style={{
        filter: `drop-shadow(0 0 8px ${colors.filter})`,
      }}
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
          onClick={() => {
            if (!isRunning) {
              setActiveMode(mode);
              setIsRunning(true);
            } else {
              setIsRunning(false);
            }
          }}
          className="rounded-full bg-primary/15 p-3.5 text-primary transition-all hover:bg-primary/25"
        >
          {isRunning && activeMode === mode ? (
            <Pause size={22} />
          ) : (
            <Play size={22} />
          )}
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