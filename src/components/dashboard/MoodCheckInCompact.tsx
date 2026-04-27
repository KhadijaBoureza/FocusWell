import { useEffect, useState } from "react";
import { Heart, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { MoodSupportPanel } from "@/components/dashboard/wellbeing/MoodComponents";
import type { MoodEntry, MoodValue } from "@/components/dashboard/wellbeing/types";
import { api } from "@/lib/api";

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

const moodValueToLabel = (mood: MoodValue) =>
  MOODS.find((m) => m.value === mood)?.label.toLowerCase() ?? "okay";

const MoodCheckInCompact = ({ onNavigate }: MoodCheckInCompactProps) => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selected, setSelected] = useState<MoodValue | null>(null);
  const [support, setSupport] = useState<{ mood: MoodValue } | null>(null);

  useEffect(() => {
    const loadMoods = async () => {
      try {
        const moods = await api.getMoodEntries();
        setEntries(moods);
      } catch (err) {
        console.error(err);
      }
    };

    loadMoods();
  }, []);

  const today = new Date().toDateString();

  const todayEntries = entries.filter(
    (e) => new Date(e.timestamp).toDateString() === today
  );

  const previousEntries = entries.filter(
    (e) => new Date(e.timestamp).toDateString() !== today
  );

  const todayAvg = todayEntries.length
    ? todayEntries.reduce((sum, e) => sum + e.mood, 0) / todayEntries.length
    : null;

  const previousAvg = previousEntries.length
    ? previousEntries.reduce((sum, e) => sum + e.mood, 0) / previousEntries.length
    : null;

  const moodTrend =
    todayAvg !== null && previousAvg !== null && previousAvg > 0
      ? Math.round(((todayAvg - previousAvg) / previousAvg) * 100)
      : null;

  const handleLog = async () => {
    if (!selected) return;

    const moodToLog = selected;

    try {
      const created = await api.createMoodEntry({
        mood: moodValueToLabel(moodToLog),
      });

      setEntries((prev) => [created, ...prev]);
      setSupport({ mood: moodToLog });
      setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card neon-border-violet p-4 md:p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-primary" />
            <h2 className="font-mono text-sm md:text-base font-semibold text-foreground">
              How is your mood today?
            </h2>
          </div>

          <div
            className={`flex items-center gap-1 text-xs font-mono ${
              moodTrend === null
                ? "text-muted-foreground"
                : moodTrend >= 0
                  ? "text-green-500"
                  : "text-red-500"
            }`}
            title="Mood trend vs previous check-ins"
          >
            {moodTrend === null || moodTrend >= 0 ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}

            <span>
              {moodTrend === null
                ? "Mood Trend"
                : `${moodTrend > 0 ? "+" : ""}${moodTrend}% Mood`}
            </span>
          </div>
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
            Log
          </button>
        </div>
      </div>

      {support && (
        <MoodSupportPanel
          mood={support.mood}
          onDismiss={() => setSupport(null)}
          onNavigate={onNavigate}
          onWriteJournal={() => {
            localStorage.setItem("focuswell-open-journal", "true");
            onNavigate?.("wellbeing");
          }}
          onShowTechniques={() => {
            localStorage.setItem("focuswell-open-techniques", "true");
            onNavigate?.("wellbeing");
          }}
        />
      )}
    </div>
  );
};

export default MoodCheckInCompact;