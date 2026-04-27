import { useMemo, useState } from "react";
import { Wind, Pencil } from "lucide-react";
import WellbeingTechniques from "./WellbeingTechniques";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { encryptText, decryptText, hashPasscode } from "@/lib/journalCrypto";
import { toast } from "@/hooks/use-toast";
import { MoodEntry, JournalEntry, MoodValue } from "./wellbeing/types";
import {
  MoodCheckIn,
  MoodSupportPanel,
  MoodTrendChart,
  MoodHistory,
} from "./wellbeing/MoodComponents";
import { JournalCard, PasscodeDialog } from "./wellbeing/JournalComponents";

interface WellbeingTrackerProps {
  onNavigate?: (tab: string) => void;
}

const WellbeingTracker = ({ onNavigate }: WellbeingTrackerProps) => {
  const [entries, setEntries] = useLocalStorage<MoodEntry[]>("focuswell-mood-entries", []);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>("focuswell-journal-entries", []);
  const [passcodeHash, setPasscodeHash] = useLocalStorage<string | null>("focuswell-journal-passcode", null);
  const [selected, setSelected] = useState<MoodValue | null>(null);
  const [support, setSupport] = useState<{ mood: MoodValue } | null>(null);
  const [standaloneJournal, setStandaloneJournal] = useState("");
  const [lockOnSave, setLockOnSave] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showTechniques, setShowTechniques] = useState(false);

  const logMood = () => {
    if (!selected) return;
    const entry: MoodEntry = {
      _id: crypto.randomUUID(),
      mood: selected,
      timestamp: new Date().toISOString(),
    };
    setEntries([entry, ...entries]);
    setSupport({ mood: selected });
    setSelected(null);
  };

  // Passcode dialog state
  const [pcDialog, setPcDialog] = useState<
    | { open: false }
    | { open: true; mode: "setup"; intent: "setup-only" | "save-locked" }
    | { open: true; mode: "unlock"; entryId: string }
  >({ open: false });
  const [pcError, setPcError] = useState<string | null>(null);

  // Per-session unlocked entries (cleared on reload)
  const [unlockedTexts, setUnlockedTexts] = useState<Record<string, string>>({});
  const unlockedIds = useMemo(() => new Set(Object.keys(unlockedTexts)), [unlockedTexts]);

  const hasPasscode = !!passcodeHash;

  const persistJournal = (entry: JournalEntry) => {
    setJournalEntries([entry, ...journalEntries]);
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
      // We need the passcode to encrypt, but we only stored its hash.
      // Ask the user to enter it once, then encrypt.
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

    // SETUP mode: create or replace passcode hash
    if (pcDialog.mode === "setup") {
      const hash = await hashPasscode(code);
      setPasscodeHash(hash);
      toast({ title: "Passcode set", description: "Locked entries will be encrypted with this code." });

      if (pcDialog.intent === "save-locked") {
        // continue saving the pending entry encrypted
        const text = standaloneJournal.trim();
        if (text) {
          try {
            const encrypted = await encryptText(text, code);
            persistJournal({
              _id: crypto.randomUUID(),
              text: "",
              locked: true,
              encrypted,
              timestamp: new Date().toISOString(),
            });
          } catch {
            toast({ title: "Could not save locked entry", variant: "destructive" });
          }
        }
      }
      setPcDialog({ open: false });
      return;
    }

    // UNLOCK mode: verify hash, then either save pending or unlock entry
    const hash = await hashPasscode(code);
    if (hash !== passcodeHash) {
      setPcError("Wrong passcode.");
      return;
    }

    if (pcDialog.entryId === "__pending_save__") {
      const text = standaloneJournal.trim();
      if (text) {
        try {
          const encrypted = await encryptText(text, code);
          persistJournal({
            _id: crypto.randomUUID(),
            text: "",
            locked: true,
            encrypted,
            timestamp: new Date().toISOString(),
          });
        } catch {
          toast({ title: "Could not save locked entry", variant: "destructive" });
        }
      }
      setPcDialog({ open: false });
      return;
    }

    // Unlock an existing entry
    const target = journalEntries.find((j) => j._id === pcDialog.entryId);
    if (!target || !target.encrypted) {
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

  const requestSetupPasscode = () => {
    setPcError(null);
    setPcDialog({ open: true, mode: "setup", intent: "setup-only" });
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries(journalEntries.filter((j) => j._id !== id));
    lockEntryAgain(id);
  };
  const deleteEntry = (id: string) => setEntries(entries.filter((e) => e._id !== id));

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

      {/* Quick action bar — always available */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setShowJournal((v) => !v);
          }}
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
          onSetupPasscode={requestSetupPasscode}
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