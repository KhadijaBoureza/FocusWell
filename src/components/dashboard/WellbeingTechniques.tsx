import { useEffect, useRef, useState } from "react";
import { Wind, Coffee, Palette, X, Play, Pause, RotateCcw } from "lucide-react";

interface WellbeingTechniquesProps {
  onClose: () => void;
}

type Technique = "breathe" | "break" | "creative";

// ============================================================
// Breathing exercise (4-7-8)
// ============================================================

const BREATH_PHASES = [
  { label: "Breathe in slowly", seconds: 4, color: "text-neon-blue" },
  { label: "Hold gently", seconds: 7, color: "text-neon-violet" },
  { label: "Let it all out", seconds: 8, color: "text-neon-green" },
] as const;

const BreatheExercise = () => {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(BREATH_PHASES[0].seconds);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        // advance phase
        setPhaseIdx((idx) => {
          const next = (idx + 1) % BREATH_PHASES.length;
          if (next === 0) setCycles((c) => c + 1);
          return next;
        });
        return 0;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  // When seconds hit 0, reset to next phase's seconds
  useEffect(() => {
    if (secondsLeft === 0) {
      setSecondsLeft(BREATH_PHASES[phaseIdx].seconds);
    }
  }, [phaseIdx, secondsLeft]);

  const reset = () => {
    setRunning(false);
    setPhaseIdx(0);
    setSecondsLeft(BREATH_PHASES[0].seconds);
    setCycles(0);
  };

  const phase = BREATH_PHASES[phaseIdx];
  const scaleClass = phaseIdx === 2 ? "scale-75" : "scale-100";

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <p className="text-sm text-foreground text-center max-w-xs">
        Let's take a slow breath together 🌬️
      </p>
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Follow the circle — in for 4, hold for 7, out for 8. Just a few rounds and you'll feel the difference.
      </p>

      <div className="relative w-40 h-40 flex items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full bg-primary/10 border border-primary/30 transition-transform duration-1000 ease-in-out ${scaleClass}`}
        />
        <div className="relative text-center">
          <p className={`font-mono text-xs uppercase tracking-wider ${phase.color}`}>
            {phase.label}
          </p>
          <p className="font-mono text-3xl font-bold text-foreground mt-1">{secondsLeft}</p>
        </div>
      </div>

      <p className="text-[11px] font-mono text-muted-foreground">
        Rounds together: <span className="text-foreground">{cycles}</span> {cycles >= 3 && "— nicely done ✨"}
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-medium hover:opacity-90 transition-all"
        >
          {running ? <Pause size={12} /> : <Play size={12} />}
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/40 text-muted-foreground font-mono text-xs hover:text-foreground hover:bg-muted/60 transition-all"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>
    </div>
  );
};

// ============================================================
// Take a break (suggestions + 5-min timer)
// ============================================================

const BREAK_IDEAS = [
  "Stand up and give your shoulders, neck, and back a gentle stretch. They've earned it.",
  "Look out a window and rest your eyes on something far away for 20 seconds. Bliss.",
  "Pour yourself a glass of water and sip it slowly. Notice how it feels.",
  "Take a little walk — around the room, down the hall, or outside for some fresh air.",
  "Close your eyes and just listen to the sounds around you for a minute.",
  "Make yourself a warm drink. No rush — enjoy every step of it.",
  "Try 10 slow shoulder rolls — 5 forward, 5 backward. Feels great.",
  "Put on your favourite song and just move. Even from your chair counts.",
  "Text someone you care about. A quick hello can lift both of you.",
];

const TakeBreak = () => {
  const [idea, setIdea] = useState(() => BREAK_IDEAS[Math.floor(Math.random() * BREAK_IDEAS.length)]);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const newIdea = () => {
    let next = idea;
    while (next === idea) next = BREAK_IDEAS[Math.floor(Math.random() * BREAK_IDEAS.length)];
    setIdea(next);
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      <p className="text-sm text-foreground text-center">
        You deserve a little pause ☕
      </p>
      <p className="text-xs text-muted-foreground text-center">
        Step away from the screen for 5 minutes — your focus will thank you when you come back.
      </p>

      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <p className="text-[10px] font-mono uppercase tracking-wider text-secondary mb-2">
          Here's an idea
        </p>
        <p className="text-sm text-foreground leading-relaxed">{idea}</p>
        <button
          onClick={newIdea}
          className="mt-3 text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors"
        >
          Show me something else →
        </button>
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="font-mono text-4xl font-bold text-foreground tabular-nums">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setRunning((r) => !r)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-medium hover:opacity-90 transition-all"
          >
            {running ? <Pause size={12} /> : <Play size={12} />}
            {running ? "Pause" : "Start break"}
          </button>
          <button
            onClick={() => {
              setRunning(false);
              setSecondsLeft(5 * 60);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/40 text-muted-foreground font-mono text-xs hover:text-foreground hover:bg-muted/60 transition-all"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Be creative (prompt generator)
// ============================================================

const CREATIVE_PROMPTS = [
  "Sketch the first thing you see using just 5 lines. Wonky is welcome.",
  "Write 3 sentences about how this exact moment feels.",
  "Think of 10 silly new uses for the closest object to you.",
  "Describe your morning like it's the opening of a movie.",
  "Doodle a creature that mashes up two of your favourite animals.",
  "Write a tiny haiku about the weather right now.",
  "Imagine the building across the street has a secret. What do you think it is?",
  "Pick a song and describe what it would look like as a painting.",
  "Rename three things in this room with cooler, weirder words.",
  "Try to describe your favourite colour to someone who's never seen it.",
  "Write down 5 things you'd put in a tiny museum about today.",
];

const BeCreative = () => {
  const [prompt, setPrompt] = useState(
    () => CREATIVE_PROMPTS[Math.floor(Math.random() * CREATIVE_PROMPTS.length)]
  );

  const newPrompt = () => {
    let next = prompt;
    while (next === prompt) next = CREATIVE_PROMPTS[Math.floor(Math.random() * CREATIVE_PROMPTS.length)];
    setPrompt(next);
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      <p className="text-sm text-foreground text-center">
        Time to play a little 🎨
      </p>
      <p className="text-xs text-muted-foreground text-center">
        Spend 2–3 minutes on this. No pressure, no judgement — it's just for you.
      </p>

      <div className="p-5 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
        <p className="text-[10px] font-mono uppercase tracking-wider text-primary mb-3">
          Your little prompt
        </p>
        <p className="text-base text-foreground leading-relaxed">{prompt}</p>
      </div>

      <button
        onClick={newPrompt}
        className="self-center inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/15 text-primary font-mono text-xs hover:bg-primary/25 transition-all"
      >
        <Palette size={12} />
        Give me another
      </button>
    </div>
  );
};

// ============================================================
// Wrapper with tabs
// ============================================================

const TECHNIQUES: { id: Technique; label: string; icon: typeof Wind }[] = [
  { id: "breathe", label: "Breathe", icon: Wind },
  { id: "break", label: "Take a break", icon: Coffee },
  { id: "creative", label: "Be creative", icon: Palette },
];

const WellbeingTechniques = ({ onClose }: WellbeingTechniquesProps) => {
  const [active, setActive] = useState<Technique>("breathe");

  return (
    <div className="glass-card neon-border-blue p-6 animate-fade-in relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        aria-label="Close techniques"
      >
        <X size={14} />
      </button>

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Wind size={18} className="text-secondary" />
          <h2 className="font-mono text-lg font-semibold text-foreground">A little reset</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          Pick whatever feels right. There's no wrong choice here.
        </p>
      </div>

      <div className="flex gap-1.5 mb-5 flex-wrap">
        {TECHNIQUES.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs transition-all ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-muted/30 text-muted-foreground border border-border hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon size={12} />
              {t.label}
            </button>
          );
        })}
      </div>

      {active === "breathe" && <BreatheExercise />}
      {active === "break" && <TakeBreak />}
      {active === "creative" && <BeCreative />}
    </div>
  );
};

export default WellbeingTechniques;