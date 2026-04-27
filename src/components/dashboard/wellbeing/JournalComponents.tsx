import { useEffect, useState } from "react";
import { BookOpen, Trash2, Lock, Unlock, KeyRound, Eye, EyeOff } from "lucide-react";
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
import { JournalEntry, MOODS, formatDay, formatTime } from "./types";

// ============================================================
// Journal card
// ============================================================

interface JournalCardProps {
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
}

export const JournalCard = ({
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
}: JournalCardProps) => (
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
            <label
                className={`inline-flex items-center gap-2 text-xs font-mono ${hasPasscode ? "text-foreground cursor-pointer" : "text-muted-foreground cursor-not-allowed"
                    }`}
                title={hasPasscode ? "Encrypt this entry with your passcode" : "Set a passcode first"}
            >
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
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Recent Entries</p>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {entries.slice(0, 10).map((j) => {
                        const mood = j.mood ? MOODS.find((m) => m.value === j.mood) : null;
                        const isLocked = !!j.locked;
                        const isUnlocked = unlockedIds.has(j._id);
                        const displayText = isLocked ? (isUnlocked ? unlockedTexts[j._id] ?? "" : "") : j.text;
                        return (
                            <div key={j._id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all group">
                                <div className="flex items-start justify-between gap-3 mb-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {mood && <span className="text-base">{mood.emoji}</span>}
                                        <p className="text-[11px] font-mono text-muted-foreground">
                                            {formatDay(j.timestamp)} · {formatTime(j.timestamp)}
                                        </p>
                                        {isLocked && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-primary">
                                                <Lock size={10} />
                                                Locked
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {isLocked && !isUnlocked && (
                                            <button
                                                onClick={() => onUnlockEntry(j._id)}
                                                className="p-1 text-muted-foreground hover:text-primary transition-all"
                                                aria-label="Unlock entry"
                                                title="Unlock with passcode"
                                            >
                                                <Unlock size={12} />
                                            </button>
                                        )}
                                        {isLocked && isUnlocked && (
                                            <button
                                                onClick={() => onLockEntry(j._id)}
                                                className="p-1 text-muted-foreground hover:text-primary transition-all"
                                                aria-label="Hide entry"
                                                title="Hide again"
                                            >
                                                <EyeOff size={12} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onDelete(j._id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                                            aria-label="Delete journal entry"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                                {isLocked && !isUnlocked ? (
                                    <p className="text-sm font-mono text-muted-foreground italic">
                                        🔒 Locked. Click the unlock icon to reveal.
                                    </p>
                                ) : (
                                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{displayText}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
    </div>
);

// ============================================================
// Passcode dialog
// ============================================================

interface PasscodeDialogProps {
    open: boolean;
    mode: "setup" | "unlock";
    error?: string | null;
    onSubmit: (code: string) => void;
    onCancel: () => void;
}

export const PasscodeDialog = ({ open, mode, error, onSubmit, onCancel }: PasscodeDialogProps) => {
    const [code, setCode] = useState("");
    const [confirm, setConfirm] = useState("");
    const [show, setShow] = useState(false);
    const isSetup = mode === "setup";

    // reset fields when dialog re-opens
   useEffect(() => {
  if (open) {
    setCode("");
    setConfirm("");
    setShow(false);
  }
}, [open]);

    const canSubmit = isSetup ? code.length >= 4 && code === confirm : code.length > 0;

    const handleSubmit = () => {
        if (!canSubmit) return;
        onSubmit(code);
    };

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
                            ? "This passcode encrypts locked entries on this device. If you forget it, locked entries cannot be recovered."
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
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        />
                        <button
                            type="button"
                            onClick={() => setShow((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                            aria-label={show ? "Hide passcode" : "Show passcode"}
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
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        />
                    )}
                    {isSetup && code.length > 0 && code.length < 4 && (
                        <p className="text-[11px] text-muted-foreground">Use at least 4 characters.</p>
                    )}
                    {isSetup && confirm.length > 0 && code !== confirm && (
                        <p className="text-[11px] text-destructive">Passcodes don't match.</p>
                    )}
                    {error && <p className="text-[11px] text-destructive">{error}</p>}
                </div>

                <DialogFooter>
                    <button
                        onClick={onCancel}
                        className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                    >
                        {isSetup ? "Set passcode" : "Unlock"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};