import { useEffect, useState } from "react";
import {
  BookOpen,
  Trash2,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Download,
  FileText,
  FileType,
  FileDown,
} from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import { JournalEntry, MOODS, formatDay, formatTime } from "./types";

// ============================================================
// Export helpers
// ============================================================

const triggerDownload = (
  content: string | Blob,
  filename: string,
  mime = "text/plain"
) => {
  const blob =
    typeof content === "string"
      ? new Blob([content], { type: `${mime};charset=utf-8` })
      : content;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const safeName = (s: string) =>
  s.replace(/[^a-z0-9-_]+/gi, "-").slice(0, 60);

const entryHeader = (j: JournalEntry) => {
  const mood = j.mood ? MOODS.find((m) => m.value === j.mood) : null;

  return `${formatDay(j.timestamp)} · ${formatTime(j.timestamp)}${
    mood ? ` · ${mood.emoji} ${mood.label}` : ""
  }`;
};

const entryBody = (
  j: JournalEntry,
  unlockedTexts: Record<string, string>
) => {
  if (j.locked) {
    return unlockedTexts[j._id] ?? "[Locked entry — unlock first to export contents]";
  }

  return j.text || "";
};

const buildTxt = (
  entries: JournalEntry[],
  unlockedTexts: Record<string, string>
) =>
  entries
    .map(
      (j) =>
        `${entryHeader(j)}\n${"-".repeat(40)}\n${entryBody(
          j,
          unlockedTexts
        )}\n`
    )
    .join("\n");

const buildMarkdown = (
  entries: JournalEntry[],
  unlockedTexts: Record<string, string>
) =>
  `# Journal Export\n\n_Exported ${new Date().toLocaleString()}_\n\n` +
  entries
    .map((j) => `## ${entryHeader(j)}\n\n${entryBody(j, unlockedTexts)}\n`)
    .join("\n---\n\n");

const buildPdf = (
  entries: JournalEntry[],
  unlockedTexts: Record<string, string>,
  title = "Journal Export"
) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, margin, y);

  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Exported ${new Date().toLocaleString()}`, margin, y);

  y += 24;

  doc.setTextColor(0);

  entries.forEach((j, idx) => {
    if (y > pageHeight - margin - 60) {
      doc.addPage();
      y = margin;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(entryHeader(j), margin, y);

    y += 16;

    doc.setDrawColor(220);
    doc.line(margin, y - 8, pageWidth - margin, y - 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const body = entryBody(j, unlockedTexts) || "(empty)";
    const lines = doc.splitTextToSize(body, maxWidth);

    lines.forEach((line: string) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      doc.text(line, margin, y);
      y += 14;
    });

    y += 16;

    if (idx < entries.length - 1 && y > pageHeight - margin - 40) {
      doc.addPage();
      y = margin;
    }
  });

  return doc;
};

const exportEntry = (
  j: JournalEntry,
  format: "pdf" | "txt" | "md",
  unlockedTexts: Record<string, string>
) => {
  const datePart = safeName(formatDay(j.timestamp));
  const base = `journal-${datePart}-${j._id.slice(0, 6)}`;

  if (format === "txt") {
    triggerDownload(
      `${entryHeader(j)}\n${"-".repeat(40)}\n${entryBody(
        j,
        unlockedTexts
      )}\n`,
      `${base}.txt`
    );
    return;
  }

  if (format === "md") {
    triggerDownload(
      `# ${entryHeader(j)}\n\n${entryBody(j, unlockedTexts)}\n`,
      `${base}.md`,
      "text/markdown"
    );
    return;
  }

  const doc = buildPdf([j], unlockedTexts, "Journal Entry");
  doc.save(`${base}.pdf`);
};

const exportAll = (
  entries: JournalEntry[],
  format: "pdf" | "txt" | "md",
  unlockedTexts: Record<string, string>
) => {
  const stamp = new Date().toISOString().slice(0, 10);
  const base = `focuswell-journal-${stamp}`;

  if (format === "txt") {
    triggerDownload(buildTxt(entries, unlockedTexts), `${base}.txt`);
    return;
  }

  if (format === "md") {
    triggerDownload(
      buildMarkdown(entries, unlockedTexts),
      `${base}.md`,
      "text/markdown"
    );
    return;
  }

  const doc = buildPdf(entries, unlockedTexts);
  doc.save(`${base}.pdf`);
};

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
        <h2 className="font-mono text-lg font-semibold text-foreground">
          Journal
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {entries.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/30 border border-border hover:border-primary/40 hover:bg-muted/50 transition-all text-[11px] font-mono text-muted-foreground"
                title="Export all entries"
              >
                <Download size={12} />
                Export all
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-[11px] font-mono">
                Download as
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => exportAll(entries, "pdf", unlockedTexts)}
              >
                <FileDown size={14} className="mr-2" />
                PDF document
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => exportAll(entries, "txt", unlockedTexts)}
              >
                <FileText size={14} className="mr-2" />
                Plain text (.txt)
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => exportAll(entries, "md", unlockedTexts)}
              >
                <FileType size={14} className="mr-2" />
                Markdown (.md)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <button
          onClick={onSetupPasscode}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/30 border border-border hover:border-primary/40 hover:bg-muted/50 transition-all text-[11px] font-mono text-muted-foreground"
        >
          <KeyRound size={12} />
          {hasPasscode ? "Change passcode" : "Set passcode"}
        </button>
      </div>
    </div>

    <p className="text-sm text-muted-foreground mb-4">
      A private space to write whatever's on your mind. Writing is like magic —
      it helps more than you'd think.
    </p>

    <Textarea
  value={draft}
  onChange={(e) => onDraftChange(e.target.value)}
  placeholder="What's on your mind today?"
  className="min-h-[120px] bg-muted/30 border-border focus-visible:border-primary/40 resize-none text-sm mb-3"
/>

    <div className="flex items-center justify-between gap-3 flex-wrap">
      <label
        className={`inline-flex items-center gap-2 text-xs font-mono ${
          hasPasscode
            ? "text-foreground cursor-pointer"
            : "text-muted-foreground cursor-not-allowed"
        }`}
        title={
          hasPasscode
            ? "Encrypt this entry with your passcode"
            : "Set a passcode first"
        }
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
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
          Recent Entries
        </p>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {entries.slice(0, 10).map((j) => {
            const mood = j.mood
              ? MOODS.find((m) => m.value === j.mood)
              : null;
            const isLocked = !!j.locked;
            const isUnlocked = unlockedIds.has(j._id);
            const displayText = isLocked
              ? isUnlocked
                ? unlockedTexts[j._id] ?? ""
                : ""
              : j.text;

            return (
              <div
                key={j._id}
                className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all group"
              >
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

                    {(!isLocked || isUnlocked) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-1 text-muted-foreground hover:text-primary transition-all"
                            aria-label="Download entry"
                            title="Download entry"
                          >
                            <Download size={12} />
                          </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() =>
                              exportEntry(j, "pdf", unlockedTexts)
                            }
                          >
                            <FileDown size={14} className="mr-2" />
                            PDF
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              exportEntry(j, "txt", unlockedTexts)
                            }
                          >
                            <FileText size={14} className="mr-2" />
                            Text (.txt)
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              exportEntry(j, "md", unlockedTexts)
                            }
                          >
                            <FileType size={14} className="mr-2" />
                            Markdown
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

// ============================================================
// Passcode dialog
// ============================================================

interface PasscodeDialogProps {
  open: boolean;
  mode: "setup" | "unlock";
  intent?: "unlock-entry" | "save-locked" | "setup-only";
  error?: string | null;
  onSubmit: (code: string) => void;
  onCancel: () => void;
}

export const PasscodeDialog = ({
  open,
  mode,
  intent = "unlock-entry",
  error,
  onSubmit,
  onCancel,
}: PasscodeDialogProps) => {
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const isSetup = mode === "setup";

  const isSavingLocked = intent === "save-locked";

  const title = isSetup
    ? "Set a passcode"
    : isSavingLocked
      ? "Confirm passcode to lock entry"
      : "Enter passcode";

  const description = isSetup
    ? "This passcode encrypts locked entries. If you forget it, locked entries cannot be recovered."
    : isSavingLocked
      ? "Enter your passcode to encrypt and save this locked journal entry."
      : "Enter your passcode to unlock this entry.";

  const buttonLabel = isSetup
    ? "Set passcode"
    : isSavingLocked
      ? "Lock entry"
      : "Unlock";

  useEffect(() => {
    if (open) {
      setCode("");
      setConfirm("");
      setShow(false);
    }
  }, [open]);

  const canSubmit = isSetup
    ? code.length >= 4 && code === confirm
    : code.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(code);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="bg-white text-foreground border border-border shadow-xl dark:bg-zinc-950">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound size={16} className="text-primary" />
            {title}
          </DialogTitle>

          <DialogDescription>{description}</DialogDescription>
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
            <p className="text-[11px] text-muted-foreground">
              Use at least 4 characters.
            </p>
          )}

          {isSetup && confirm.length > 0 && code !== confirm && (
            <p className="text-[11px] text-destructive">
              Passcodes don't match.
            </p>
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
  onClick={() => {
    console.log("Set passcode button clicked");
    handleSubmit();
  }}
  disabled={!canSubmit}
  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
>
  {buttonLabel}
</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};