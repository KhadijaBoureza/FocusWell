import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
  BookOpen,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Wind,
  Pencil,
} from "lucide-react";
import WellbeingTechniques from "./WellbeingTechniques";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  encryptText,
  decryptText,
  hashPasscode,
  EncryptedPayload,
} from "@/lib/journalCrypto";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

type MoodValue = 1 | 2 | 3 | 4 | 5;

interface MoodEntry {
  _id: string;
  mood: MoodValue;
  timestamp: string;
}

interface JournalEntry {
  _id: string;
  text: string;
  mood?: MoodValue;
  timestamp: string;
  locked?: boolean;
  encrypted?: EncryptedPayload;
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

const moodLabelToValue = (mood: unknown): MoodValue => {
  if (typeof mood === "number" && mood >= 1 && mood <= 5) return mood as MoodValue;

  const normalized = String(mood).toLowerCase();
  const found = MOODS.find((m) => m.label.toLowerCase() === normalized);

  return found?.value ?? 3;
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const MoodCheckIn = ({
  selected,
  onSelect,
  onLog,
}: {
  selected: MoodValue | null;
  onSelect: (m: MoodValue) => void;
  onLog: () => void;
}) => (
  <div className="glass-card neon-border-violet p-6">
    <div className="flex items-center gap-2 mb-4">
      <Heart size={18} className="text-primary" />
      <h2 className="font-mono text-lg font-semibold text-foreground">
        How are you feeling?
      </h2>
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

const MoodSupportPanel = ({
  mood,
  onDismiss,
  onNavigate,
  onWriteJournal,
  onShowTechniques,
}: {
  mood: MoodValue;
  onDismiss: () => void;
  onNavigate?: (tab: string) => void;
  onWriteJournal: () => void;
  onShowTechniques: () => void;
}) => {
  const moodInfo = MOODS.find((m) => m.value === mood)!;
  const isAwful = mood === 1;
  const isLow = mood === 2;
  const isOkay = mood === 3;
  const isGood = mood === 4;

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
    ? "Pin a worry to your dashboard, write a journal entry, or try a quick reset technique."
    : isLow
      ? "Pin what's bothering you, write it out in the journal, or try a breathing exercise."
      : isOkay
        ? "Pin a quick thought, journal what's on your mind, or take a short reset."
        : isGood
          ? "Whatever you're doing — keep at it. Journal what's working, or take a creative break."
          : "Hold onto this. Journal what's working and lean into more of it.";

  const borderClass =
    isAwful || isLow
      ? "neon-border-pink"
      : isOkay
        ? "neon-border-blue"
        : "neon-border-green";

  return (
    <div className={`glass-card ${borderClass} p-6 animate-fade-in relative`}>
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
      >
        <X size={14} />
      </button>

      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">{moodInfo.emoji}</span>
        <h3 className="font-mono text-base font-semibold text-foreground">
          {headline}
        </h3>
      </div>

      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        {subline}
      </p>

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
    </div>
  );
};

const MoodTrendChart = ({
  chartData,
  todayAvg,
  weekAvg,
  totalLogs,
}: {
  chartData: { day: string; mood: number | null; key: string }[];
  todayAvg: string;
  weekAvg: string;
  totalLogs: number;
}) => (
  <div className="glass-card neon-border-blue p-6">
    <div className="flex items-center gap-2 mb-4">
      <TrendingUp size={18} className="text-secondary" />
      <h2 className="font-mono text-lg font-semibold text-foreground">
        7-Day Mood Trend
      </h2>
    </div>

    <div className="grid grid-cols-3 gap-3 mb-5">
      <div className="text-center p-2 rounded-lg bg-muted/30">
        <p className="font-mono text-xl font-bold text-foreground">{todayAvg}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Today Avg
        </p>
      </div>

      <div className="text-center p-2 rounded-lg bg-muted/30">
        <p className="font-mono text-xl font-bold text-foreground">{weekAvg}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Week Avg
        </p>
      </div>

      <div className="text-center p-2 rounded-lg bg-muted/30">
        <p className="font-mono text-xl font-bold text-foreground">{totalLogs}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Total Logs
        </p>
      </div>
    </div>

    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} />
          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v: number) => [v.toFixed(2), "Mood"]} />
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

const JournalCard = ({
  draft,
  entries,
  hasPasscode,
  unlockedIds,
  unlockedTexts,
  lockOnSave,
  onDraftChange,
  onLockOnSaveChange,
  onSave,
  onDelete,
  onUnlockEntry,
  onLockEntry,
  onSetupPasscode,
}: {
  draft: string;
  entries: JournalEntry[];
  hasPasscode: boolean;
  unlockedIds: Set<string>;
  unlockedTexts: Record<string, string>;
  lockOnSave: boolean;
  onDraftChange: (v: string) => void;
  onLockOnSaveChange: (v: boolean) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onUnlockEntry: (id: string) => void;
  onLockEntry: (id: string) => void;
  onSetupPasscode: () => void;
}) => (
  <div className="glass-card neon-border-violet p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <BookOpen size={18} className="text-primary" />
        <h2 className="font-mono text-lg font-semibold text-foreground">Journal</h2>
      </div>

      {!hasPasscode && (
        <button
          onClick={onSetupPasscode}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/30 border border-border hover:border-primary/40 hover:bg-muted/50 transition-all text-[11px] font-mono text-muted-foreground"
        >
          <KeyRound size={12} />
          Set passcode
        </button>
      )}
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

    <div className="flex items-center justify-between gap-3 flex-wrap">
      <label className="inline-flex items-center gap-2 text-xs font-mono text-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={lockOnSave && hasPasscode}
          disabled={!hasPasscode}
          onChange={(e) => onLockOnSaveChange(e.target.checked)}
          className="accent-primary"
        />
        <Lock size={12} />
        Lock this entry
      </label>

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
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
          Recent Entries
        </p>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {entries.slice(0, 10).map((j) => {
            const isLocked = !!j.locked;
            const isUnlocked = unlockedIds.has(j._id);
            const displayText = isLocked
              ? isUnlocked
                ? unlockedTexts[j._id] ?? ""
                : ""
              : j.text;

            return (
              <div key={j._id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all group">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <p className="text-[11px] font-mono text-muted-foreground">
                    {formatDay(j.timestamp)} · {formatTime(j.timestamp)}
                  </p>

                  <div className="flex items-center gap-1">
                    {isLocked && !isUnlocked && (
                      <button onClick={() => onUnlockEntry(j._id)} className="p-1 text-muted-foreground hover:text-primary">
                        <Unlock size={12} />
                      </button>
                    )}

                    {isLocked && isUnlocked && (
                      <button onClick={() => onLockEntry(j._id)} className="p-1 text-muted-foreground hover:text-primary">
                        <EyeOff size={12} />
                      </button>
                    )}

                    <button onClick={() => onDelete(j._id)} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {isLocked && !isUnlocked ? (
                  <p className="text-sm font-mono text-muted-foreground italic">
                    🔒 Locked. Click the unlock icon to reveal.
                  </p>
                ) : (
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {displayText}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
);

const PasscodeDialog = ({
  open,
  mode,
  error,
  onSubmit,
  onCancel,
}: {
  open: boolean;
  mode: "setup" | "unlock";
  error?: string | null;
  onSubmit: (code: string) => void;
  onCancel: () => void;
}) => {
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const isSetup = mode === "setup";

  useEffect(() => {
    if (open) {
      setCode("");
      setConfirm("");
      setShow(false);
    }
  }, [open]);

  const canSubmit = isSetup ? code.length >= 4 && code === confirm : code.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound size={16} className="text-primary" />
            {isSetup ? "Set a passcode" : "Enter passcode"}
          </DialogTitle>
          <DialogDescription>
            {isSetup
              ? "This passcode encrypts locked entries. If you forget it, locked entries cannot be recovered."
              : "Enter your passcode to unlock this entry."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Passcode"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {isSetup && (
            <Input
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm passcode"
            />
          )}

          {error && <p className="text-[11px] text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <button onClick={onCancel} className="px-3 py-2 rounded-lg text-sm text-muted-foreground">
            Cancel
          </button>
          <button
            onClick={() => canSubmit && onSubmit(code)}
            disabled={!canSubmit}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm disabled:opacity-40"
          >
            {isSetup ? "Set passcode" : "Unlock"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MoodHistory = ({
  grouped,
  totalEntries,
  onDelete,
}: {
  grouped: [string, MoodEntry[]][];
  totalEntries: number;
  onDelete: (id: string) => void;
}) => (
  <div className="glass-card neon-border-pink p-6">
    <h2 className="font-mono text-lg font-semibold text-foreground mb-4">
      Recent Check-ins
    </h2>

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
                  <div key={e._id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all group">
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

const WellbeingTracker = ({ onNavigate }: WellbeingTrackerProps) => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [passcodeHash, setPasscodeHash] = useState<string | null>(
    () => localStorage.getItem("focuswell-journal-passcode")
  );

  const [selected, setSelected] = useState<MoodValue | null>(null);
  const [support, setSupport] = useState<{ mood: MoodValue } | null>(null);
  const [standaloneJournal, setStandaloneJournal] = useState("");
  const [lockOnSave, setLockOnSave] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showTechniques, setShowTechniques] = useState(false);

  const [pcDialog, setPcDialog] = useState<
    | { open: false }
    | { open: true; mode: "setup"; intent: "setup-only" | "save-locked" }
    | { open: true; mode: "unlock"; entryId: string }
  >({ open: false });

  const [pcError, setPcError] = useState<string | null>(null);
  const [unlockedTexts, setUnlockedTexts] = useState<Record<string, string>>({});
  const unlockedIds = useMemo(() => new Set(Object.keys(unlockedTexts)), [unlockedTexts]);

  const hasPasscode = !!passcodeHash;

  useEffect(() => {
    if (passcodeHash) {
      localStorage.setItem("focuswell-journal-passcode", passcodeHash);
    }
  }, [passcodeHash]);

  useEffect(() => {
    const load = async () => {
      const [moods, journals] = await Promise.all([
        api.getMoodEntries(),
        api.getJournalEntries(),
      ]);

      setEntries(
        moods.map((entry) => ({
          ...entry,
          mood: moodLabelToValue(entry.mood),
        }))
      );

      setJournalEntries(journals);
    };

    load();
  }, []);

  const logMood = async () => {
    if (!selected) return;

    const created = await api.createMoodEntry({
      mood: String(selected),
    });

    const newEntry: MoodEntry = {
      ...created,
      mood: moodLabelToValue(created.mood),
    };

    setEntries((prev) => [newEntry, ...prev]);
    setSupport({ mood: selected });
    setSelected(null);
  };

  const persistJournal = (entry: JournalEntry) => {
    setJournalEntries((prev) => [entry, ...prev]);
    setStandaloneJournal("");
  };

  const saveStandaloneJournal = async () => {
    const text = standaloneJournal.trim();
    if (!text) return;

    if (lockOnSave && !hasPasscode) {
      setPcDialog({ open: true, mode: "setup", intent: "save-locked" });
      return;
    }

    if (lockOnSave && hasPasscode) {
      setPcDialog({ open: true, mode: "unlock", entryId: "__pending_save__" });
      return;
    }

    persistJournal({
      _id: crypto.randomUUID(),
      text,
      timestamp: new Date().toISOString(),
    });
  };

  const handlePasscodeSubmit = async (code: string) => {
    setPcError(null);
    if (!pcDialog.open) return;

    if (pcDialog.mode === "setup") {
      const hash = await hashPasscode(code);
      setPasscodeHash(hash);

      if (pcDialog.intent === "save-locked") {
        const text = standaloneJournal.trim();
        const encrypted = await encryptText(text, code);

        persistJournal({
          _id: crypto.randomUUID(),
          text: "",
          locked: true,
          encrypted,
          timestamp: new Date().toISOString(),
        });
      }

      toast({ title: "Passcode set" });
      setPcDialog({ open: false });
      return;
    }

    const hash = await hashPasscode(code);
    if (hash !== passcodeHash) {
      setPcError("Wrong passcode.");
      return;
    }

    if (pcDialog.entryId === "__pending_save__") {
      const text = standaloneJournal.trim();
      const encrypted = await encryptText(text, code);

      persistJournal({
        _id: crypto.randomUUID(),
        text: "",
        locked: true,
        encrypted,
        timestamp: new Date().toISOString(),
      });

      setPcDialog({ open: false });
      return;
    }

    const target = journalEntries.find((j) => j._id === pcDialog.entryId);
    if (!target?.encrypted) {
      setPcError("Entry not found.");
      return;
    }

    try {
      const plaintext = await decryptText(target.encrypted, code);
      setUnlockedTexts((prev) => ({ ...prev, [target._id]: plaintext }));
      setPcDialog({ open: false });
    } catch {
      setPcError("Could not decrypt with this code.");
    }
  };

  const requestUnlock = (id: string) => {
    setPcError(null);
    setPcDialog({ open: true, mode: "unlock", entryId: id });
  };

  const lockEntryAgain = (id: string) => {
    setUnlockedTexts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((j) => j._id !== id));
    lockEntryAgain(id);
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e._id !== id));
  };

  const chartData = useMemo(() => {
    const days: { day: string; mood: number | null; key: string }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const key = d.toDateString();
      const dayEntries = entries.filter(
        (e) => new Date(e.timestamp).toDateString() === key
      );

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

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowJournal((v) => !v)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-md font-mono text-xs transition-all border ${
            showJournal
              ? "bg-secondary/15 text-secondary border-secondary/30"
              : "bg-muted/30 text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Pencil size={14} />
          {showJournal ? "Hide journal" : "Write journal"}
        </button>

        <button
          onClick={() => setShowTechniques((v) => !v)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-md font-mono text-xs transition-all border ${
            showTechniques
              ? "bg-primary/15 text-primary border-primary/30"
              : "bg-muted/30 text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Wind size={14} />
          {showTechniques ? "Hide reset" : "Take a little reset"}
        </button>
      </div>

      {support && (
        <MoodSupportPanel
          mood={support.mood}
          onDismiss={() => setSupport(null)}
          onNavigate={onNavigate}
          onWriteJournal={() => setShowJournal(true)}
          onShowTechniques={() => setShowTechniques(true)}
        />
      )}

      {showTechniques && <WellbeingTechniques onClose={() => setShowTechniques(false)} />}

      {showJournal && (
        <JournalCard
          draft={standaloneJournal}
          entries={journalEntries}
          hasPasscode={hasPasscode}
          unlockedIds={unlockedIds}
          unlockedTexts={unlockedTexts}
          lockOnSave={lockOnSave}
          onDraftChange={setStandaloneJournal}
          onLockOnSaveChange={setLockOnSave}
          onSave={saveStandaloneJournal}
          onDelete={deleteJournalEntry}
          onUnlockEntry={requestUnlock}
          onLockEntry={lockEntryAgain}
          onSetupPasscode={() =>
            setPcDialog({ open: true, mode: "setup", intent: "setup-only" })
          }
        />
      )}

      <MoodTrendChart
        chartData={chartData}
        todayAvg={todayAvg}
        weekAvg={weekAvg}
        totalLogs={entries.length}
      />

      <MoodHistory grouped={grouped} totalEntries={entries.length} onDelete={deleteEntry} />

      <PasscodeDialog
        open={pcDialog.open}
        mode={pcDialog.open ? pcDialog.mode : "unlock"}
        error={pcError}
        onSubmit={handlePasscodeSubmit}
        onCancel={() => {
          setPcDialog({ open: false });
          setPcError(null);
        }}
      />
    </div>
  );
};

export default WellbeingTracker;