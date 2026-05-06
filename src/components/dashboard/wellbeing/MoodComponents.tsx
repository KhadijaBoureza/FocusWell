import { Heart, Sparkles, Trash2, TrendingUp, X, Wind, Pencil } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  MOODS,
  formatDay,
  formatTime,
  type MoodEntry,
  type MoodValue,
} from "./types";

const getMoodInfo = (value: number) =>
  MOODS.find((m) => m.value === Math.round(value)) ?? MOODS[2];

interface MoodCheckInProps {
  selected: MoodValue | null;
  onSelect: (m: MoodValue) => void;
  onLog: () => void;
}

export const MoodCheckIn = ({ selected, onSelect, onLog }: MoodCheckInProps) => (
  <div className="glass-card neon-border-violet p-6">
    <div className="flex items-center gap-2 mb-4">
      <Heart size={18} className="text-primary" />
      <h2 className="font-mono text-lg font-semibold text-foreground">How is your mood today?</h2>
    </div>

    <p className="text-sm text-muted-foreground mb-5">
      Quick check-in. Log as many times as you'd like throughout the day.
    </p>

    <div className="grid grid-cols-5 gap-2 md:gap-3 mb-5">
      {MOODS.map((m) => (
        <button
          key={m.value}
          onClick={() => onSelect(m.value)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
            selected === m.value
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
  onNavigate?: (tab: string) => void;
  onWriteJournal: () => void;
  onShowTechniques: () => void;
}

export const MoodSupportPanel = ({
  mood,
  onDismiss,
  onNavigate,
  onWriteJournal,
  onShowTechniques,
}: MoodSupportPanelProps) => {
  const moodInfo = MOODS.find((m) => m.value === mood)!;

  const headline =
    mood === 1
      ? "I'm sorry to hear that."
      : mood === 2
        ? "That's okay. Be gentle with yourself."
        : mood === 3
          ? "Logged. Hope it lifts."
          : mood === 4
            ? "Glad to hear it. Keep going."
            : "That's what I love to hear.";

  const subline =
    mood === 1
      ? "Pin a worry to your dashboard, write a journal entry, or try a quick reset technique."
      : mood === 2
        ? "Pin what's bothering you, write it out in the journal, or try a breathing exercise."
        : mood === 3
          ? "Pin a quick thought, journal what's on your mind, or take a short reset."
          : mood === 4
            ? "Whatever you're doing — keep at it. Journal what's working, or take a creative break."
            : "Hold onto this. Journal what's working and lean into more of it.";

  const borderClass =
    mood === 1 || mood === 2
      ? "neon-border-pink"
      : mood === 3
        ? "neon-border-blue"
        : "neon-border-green";

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

      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{subline}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {onNavigate && (
          <button
            onClick={() => onNavigate("thoughts")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary/15 text-primary hover:bg-primary/25 transition-all font-mono text-xs"
          >
            <Sparkles size={14} />
            Pin to Thoughts
          </button>
        )}

        <button
          onClick={onWriteJournal}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/15 text-secondary hover:bg-secondary/25 transition-all font-mono text-xs"
        >
          <Pencil size={14} />
          Write journal
        </button>

        <button
          onClick={onShowTechniques}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-muted/40 text-foreground border border-border hover:bg-muted/60 transition-all font-mono text-xs"
        >
          <Wind size={14} />
          Take a little reset
        </button>
      </div>

      {(mood === 1 || mood === 2) && (
        <p className="text-[11px] text-muted-foreground mt-4 pt-4 border-t border-border leading-relaxed">
          If things feel really heavy, talking to someone helps . A friend, a relative, or a crisis line in your country. You are not alone.
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

export const MoodTrendChart = ({ chartData, todayAvg, weekAvg, totalLogs }: MoodTrendChartProps) => (
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
            tickFormatter={(value) => getMoodInfo(Number(value)).label}
            tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={45}
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
            formatter={(v: number) => {
              const mood = getMoodInfo(v);
              return [`${mood.emoji} ${mood.label}`, "Mood"];
            }}
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

interface MoodHistoryProps {
  grouped: [string, MoodEntry[]][];
  totalEntries: number;
  onDelete: (id: string) => void;
}

export const MoodHistory = ({ grouped, totalEntries, onDelete }: MoodHistoryProps) => (
  <div className="glass-card neon-border-pink p-6">
    <h2 className="font-mono text-lg font-semibold text-foreground mb-4">
      Recent Check-ins
    </h2>

    {totalEntries === 0 ? (
      <p className="text-sm text-muted-foreground text-center py-8">
        No check-ins yet. Log your first mood above ✨
      </p>
    ) : (
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
        {grouped.map(([day, dayEntries]) => (
          <div key={day}>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              {formatDay(dayEntries[0].timestamp)}
            </p>

            <div className="space-y-1.5">
              {dayEntries.map((e) => {
                const mood = getMoodInfo(e.mood);

                return (
                  <div
                    key={e._id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{mood.emoji}</span>

                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {e.label ?? mood.label}
                        </p>

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