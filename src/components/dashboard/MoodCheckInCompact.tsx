import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type MoodValue = 1 | 2 | 3 | 4 | 5;

interface MoodEntry {
  id: string;
  mood: MoodValue;
  timestamp: string;
}

const MOODS: { value: MoodValue; emoji: string; label: string }[] = [
  { value: 1, emoji: "😞", label: "Awful" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
];

interface MoodCheckInCompactProps {
  onNavigate?: (tab: string) => void;
}

const MoodCheckInCompact = ({ onNavigate }: MoodCheckInCompactProps) => {
  const [entries, setEntries] = useLocalStorage<MoodEntry[]>("wellbeing-mood-entries", []);
  const [selected, setSelected] = useState<MoodValue | null>(null);
  const [justLogged, setJustLogged] = useState(false);

  const handleLog = () => {
    if (!selected) return;
    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      mood: selected,
      timestamp: new Date().toISOString(),
    };
    setEntries([entry, ...entries]);
    setJustLogged(true);
    setSelected(null);
    setTimeout(() => setJustLogged(false), 2000);
  };

  return (
    <div className="glass-card neon-border-violet p-4 md:p-5">
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-primary" />
          <h2 className="font-mono text-sm md:text-base font-semibold text-foreground">
            How are you feeling?
          </h2>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate("wellbeing")}
            className="text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            Open Wellbeing →
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="grid grid-cols-5 gap-1.5 md:gap-2 flex-1">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelected(m.value)}
              title={m.label}
              className={`flex items-center justify-center py-2 rounded-lg border transition-all ${
                selected === m.value
                  ? "border-primary bg-primary/15 neon-glow-violet scale-105"
                  : "border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/40"
              }`}
            >
              <span className="text-xl md:text-2xl">{m.emoji}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleLog}
          disabled={!selected}
          className="flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all whitespace-nowrap"
        >
          <Sparkles size={12} />
          {justLogged ? "Logged" : "Log"}
        </button>
      </div>
    </div>
  );
};

export default MoodCheckInCompact;