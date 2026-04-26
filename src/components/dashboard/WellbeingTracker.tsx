import { useEffect, useMemo, useState } from "react";
import { Heart, Sparkles, Trash2, TrendingUp, X, BookOpen } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
// import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

// ============================================================
// Types & constants
// ============================================================

type MoodValue = 1 | 2 | 3 | 4 | 5;

interface MoodEntry {
  _id: string;
  mood: MoodValue;
  timestamp: string; // ISO
}

interface JournalEntry {
  _id: string;
  text: string;
  mood?: MoodValue;
  timestamp: string;
}

interface WellbeingTrackerProps {
  onNavigate?: (tab: string) => void;
}

const MOODS: { value: MoodValue; emoji: string; label: string; color: string }[] = [
  { value: 1, emoji: "😞", label: "Awful", color: "hsl(var(--neon-pink))" },
  { value: 2, emoji: "😕", label: "Low", color: "hsl(var(--accent))" },
  { value: 3, emoji: "😐", label: "Okay", color: "hsl(var(--muted-foreground))" },
  { value: 4, emoji: "🙂", label: "Good", color: "hsl(var(--secondary))" },
  { value: 5, emoji: "😄", label: "Great", color: "hsl(var(--neon-green))" },
];

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

// ============================================================
// Sub-components (kept in this file for simplicity)
// ============================================================

interface MoodCheckInProps {
  selected: MoodValue | null;
  onSelect: (m: MoodValue) => void;
  onLog: () => void;
}

const MoodCheckIn = ({ selected, onSelect, onLog }: MoodCheckInProps) => (
  <div className="glass-card neon-border-violet p-6">
    <div className="flex items-center gap-2 mb-4">
      <Heart size={18} className="text-primary" />
      <h2 className="font-mono text-lg font-semibold text-foreground">How are you feeling?</h2>
    </div>
    <p className="text-sm text-muted-foreground mb-5">
      Quick check-in. Log as many times as you'd like throughout the day.
    </p>

    <div className="grid grid-cols-5 gap-2 md:gap-3 mb-5">
      {MOODS.map((m) => (
        <button
          key={m.value}
          onClick={() => onSelect(m.value)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${selected === m.value
            ? "border-primary bg-primary/15 neon-glow-violet scale-105"
            : "border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/40"
            }`}
        >
          <span className="text-2xl md:text-3xl">{m.emoji}</span>
          <span className="text-[10px] md:text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {m.label}
          </span>
        </button>
      ))}
    </div>

    <button
      onClick={onLog}
      disabled={!selected}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
    >
      <Sparkles size={14} />
      Log mood
    </button>
  </div>
);

interface MoodSupportPanelProps {
  mood: MoodValue;
  onDismiss: () => void;
}

const MoodSupportPanel = ({ mood, onDismiss }: MoodSupportPanelProps) => {
  const moodInfo = MOODS.find((m) => m.value === mood)!;
  const isAwful = mood === 1;
  const isLow = mood === 2;
  const isOkay = mood === 3;
  const isGood = mood === 4;
  const isGreat = mood === 5;

  const headline = isAwful
    ? "I'm sorry to hear that."
    : isLow
      ? "That's okay. Be gentle with yourself."
      : isOkay
        ? "Logged. Hope it lifts."
        : isGood
          ? "Glad to hear it. Keep going."
          : "That's what I love to hear.";

  const subline = isAwful
    ? "Pin a quick worry to your dashboard, or journal why you feel this way in detail. Writing is like magic — it helps more than you'd think."
    : isLow
      ? "Pin what's bothering you to your dashboard so it's out of your head, or journal why you feel this way. Writing helps."
      : isOkay
        ? "Pin a quick thought to your dashboard, or journal what's on your mind. Writing things out really helps."
        : isGood
          ? "Whatever you're doing — keep at it. Journal what's working so you remember."
          : isGreat
            ? "Hold onto this. Journal what's working and lean into more of it."
            : null;

  const borderClass = isAwful || isLow ? "neon-border-pink" : isOkay ? "neon-border-blue" : "neon-border-green";

  return (
    <div className={`glass-card ${borderClass} p-6 animate-fade-in relative`}>
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>

      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">{moodInfo.emoji}</span>
        <h3 className="font-mono text-base font-semibold text-foreground">{headline}</h3>
      </div>

      {subline && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{subline}</p>}

      {(isAwful || isLow) && (
        <p className="text-[11px] text-muted-foreground mt-4 pt-4 border-t border-border leading-relaxed">
          If things feel really heavy, talking to someone helps — a friend, a relative, or a crisis line in your country. You are not alone.
        </p>
      )}
    </div>
  );
};

interface MoodTrendChartProps {
  chartData: { day: string; mood: number | null; key: string }[];
  todayAvg: string;
  weekAvg: string;
  totalLogs: number;
}

const MoodTrendChart = ({ chartData, todayAvg, weekAvg, totalLogs }: MoodTrendChartProps) => (
  <div className="glass-card neon-border-blue p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <TrendingUp size={18} className="text-secondary" />
        <h2 className="font-mono text-lg font-semibold text-foreground">7-Day Mood Trend</h2>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3 mb-5">
      <div className="text-center p-2 rounded-lg bg-muted/30">
        <p className="font-mono text-xl font-bold text-foreground">{todayAvg}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Today Avg</p>
      </div>
      <div className="text-center p-2 rounded-lg bg-muted/30">
        <p className="font-mono text-xl font-bold text-foreground">{weekAvg}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Week Avg</p>
      </div>
      <div className="text-center p-2 rounded-lg bg-muted/30">
        <p className="font-mono text-xl font-bold text-foreground">{totalLogs}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Logs</p>
      </div>
    </div>

    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fontFamily: "JetBrains Mono", fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 11, fontFamily: "JetBrains Mono", fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={25}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
              fontFamily: "JetBrains Mono",
              color: "hsl(var(--foreground))",
            }}
            formatter={(v: number) => [v.toFixed(2), "Mood"]}
          />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

interface JournalCardProps {
  draft: string;
  entries: JournalEntry[];
  onDraftChange: (v: string) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
}

const JournalCard = ({ draft, entries, onDraftChange, onSave, onDelete }: JournalCardProps) => (
  <div className="glass-card neon-border-violet p-6">
    <div className="flex items-center gap-2 mb-4">
      <BookOpen size={18} className="text-primary" />
      <h2 className="font-mono text-lg font-semibold text-foreground">Journal</h2>
    </div>
    <p className="text-sm text-muted-foreground mb-4">
      A private space to write whatever's on your mind. Writing is like magic — it helps more than you'd think.
    </p>
    <Textarea
      value={draft}
      onChange={(e) => onDraftChange(e.target.value)}
      placeholder="What's on your mind today?"
      className="min-h-[120px] bg-muted/30 border-border focus-visible:border-primary/40 resize-none text-sm mb-3"
    />
    <div className="flex justify-end">
      <button
        onClick={onSave}
        disabled={!draft.trim()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
      >
        <BookOpen size={14} />
        Save entry
      </button>
    </div>

    {entries.length > 0 && (
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Recent Entries</p>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {entries.slice(0, 10).map((j) => {
            const mood = j.mood ? MOODS.find((m) => m.value === j.mood) : null;
            return (
              <div key={j._id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all group">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    {mood && <span className="text-base">{mood.emoji}</span>}
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {formatDay(j.timestamp)} · {formatTime(j.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(j._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                    aria-label="Delete journal entry"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{j.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
);

interface MoodHistoryProps {
  grouped: [string, MoodEntry[]][];
  totalEntries: number;
  onDelete: (id: string) => void;
}

const MoodHistory = ({ grouped, totalEntries, onDelete }: MoodHistoryProps) => (
  <div className="glass-card neon-border-pink p-6">
    <h2 className="font-mono text-lg font-semibold text-foreground mb-4">Recent Check-ins</h2>
    {totalEntries === 0 ? (
      <p className="text-sm text-muted-foreground text-center py-8">
        No check-ins yet. Log your first mood above ✨
      </p>
    ) : (
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {grouped.map(([day, dayEntries]) => (
          <div key={day}>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              {formatDay(dayEntries[0].timestamp)}
            </p>
            <div className="space-y-1.5">
              {dayEntries.map((e) => {
                const mood = MOODS.find((m) => m.value === e.mood)!;
                return (
                  <div
                    key={e._id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{mood.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{mood.label}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">
                          {formatDay(e.timestamp)} · {formatTime(e.timestamp)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(e._id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive transition-all"
                      aria-label="Delete entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ============================================================
// Main component
// ============================================================

const WellbeingTracker = (_props: WellbeingTrackerProps) => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MoodValue | null>(null);
  const [support, setSupport] = useState<{ mood: MoodValue } | null>(null);
  const [standaloneJournal, setStandaloneJournal] = useState("");


  useEffect(() => {
    async function loadWellbeingData() {
      try {
        setLoading(true);

        const [moods, journal] = await Promise.all([
          api.getMoodEntries(),
          api.getJournalEntries(),
        ]);

        setEntries(moods);
        setJournalEntries(journal);
      } catch (err) {
        console.error("Failed to load wellbeing data", err);
      } finally {
        setLoading(false);
      }
    }

    loadWellbeingData();
  }, []);

  const logMood = async () => {
    if (!selected) return;

    const moodLabel = MOODS.find((m) => m.value === selected)?.label.toLowerCase();
    if (!moodLabel) return;

    try {
      const newEntry = await api.createMoodEntry({
        mood: moodLabel,
      });

      setEntries((prev) => [newEntry, ...prev]);
      setSupport({ mood: selected });
      setSelected(null);
    } catch (err) {
      console.error("Failed to log mood", err);
    }
  };

  const saveStandaloneJournal = async () => {
    if (!standaloneJournal.trim()) return;

    try {
      const newEntry = await api.createJournalEntry({
        text: standaloneJournal.trim(),
      });

      setJournalEntries((prev) => [newEntry, ...prev]);
      setStandaloneJournal("");
    } catch (err) {
      console.error("Failed to save journal entry", err);
    }
  };

  const deleteJournalEntry = async (id: string) => {
    try {
      await api.deleteJournalEntry(id);
      setJournalEntries((prev) => prev.filter((j) => j._id !== id));
    } catch (err) {
      console.error("Failed to delete journal entry", err);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await api.deleteMoodEntry(id);
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Failed to delete mood entry", err);
    }
  };

  // Build last-7-days chart data (average mood per day)
  const chartData = useMemo(() => {
    const days: { day: string; mood: number | null; key: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const dayEntries = entries.filter((e) => new Date(e.timestamp).toDateString() === key);
      const avg = dayEntries.length
        ? dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length
        : null;
      days.push({
        day: d.toLocaleDateString([], { weekday: "short" }),
        mood: avg !== null ? Number(avg.toFixed(2)) : null,
        key,
      });
    }
    return days;
  }, [entries]);

  const todayEntries = entries.filter(
    (e) => new Date(e.timestamp).toDateString() === new Date().toDateString()
  );
  const todayAvg = todayEntries.length
    ? (todayEntries.reduce((s, e) => s + e.mood, 0) / todayEntries.length).toFixed(1)
    : "—";

  const weekValues = chartData.filter((d) => d.mood !== null).map((d) => d.mood as number);
  const weekAvg = weekValues.length
    ? (weekValues.reduce((s, v) => s + v, 0) / weekValues.length).toFixed(1)
    : "—";

  const grouped = useMemo(() => {
    const map = new Map<string, MoodEntry[]>();
    entries.forEach((e) => {
      const k = new Date(e.timestamp).toDateString();
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    });
    return Array.from(map.entries()).slice(0, 7);
  }, [entries]);

  return (
    <div className="space-y-6 animate-fade-in">
      <MoodCheckIn selected={selected} onSelect={setSelected} onLog={logMood} />

      {support && (
        <MoodSupportPanel mood={support.mood} onDismiss={() => setSupport(null)} />
      )}

      <JournalCard
        draft={standaloneJournal}
        entries={journalEntries}
        onDraftChange={setStandaloneJournal}
        onSave={saveStandaloneJournal}
        onDelete={deleteJournalEntry}
      />

      <MoodTrendChart
        chartData={chartData}
        todayAvg={todayAvg}
        weekAvg={weekAvg}
        totalLogs={entries.length}
      />

      <MoodHistory grouped={grouped} totalEntries={entries.length} onDelete={deleteEntry} />
    </div>
  );
};

export default WellbeingTracker;