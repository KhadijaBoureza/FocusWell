import type { EncryptedPayload } from "@/lib/journalCrypto";

export type MoodValue = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  _id: string;
  mood: MoodValue;
  timestamp: string;
}

export interface JournalEntry {
  _id: string;
  text: string;
  mood?: MoodValue;
  timestamp: string;
  locked?: boolean;
  encrypted?: EncryptedPayload;
}

export interface WellbeingTrackerProps {
  onNavigate?: (tab: string) => void;
}

export const MOODS: {
  value: MoodValue;
  emoji: string;
  label: string;
  color: string;
}[] = [
  { value: 1, emoji: "😞", label: "Awful", color: "hsl(var(--neon-pink))" },
  { value: 2, emoji: "😕", label: "Low", color: "hsl(var(--accent))" },
  { value: 3, emoji: "😐", label: "Okay", color: "hsl(var(--muted-foreground))" },
  { value: 4, emoji: "🙂", label: "Good", color: "hsl(var(--secondary))" },
  { value: 5, emoji: "😄", label: "Great", color: "hsl(var(--neon-green))" },
];

export const moodLabelToValue = (mood: unknown): MoodValue => {
  if (typeof mood === "number" && mood >= 1 && mood <= 5) return mood as MoodValue;

  const normalized = String(mood).toLowerCase();
  const found = MOODS.find((m) => m.label.toLowerCase() === normalized);

  return found?.value ?? 3;
};

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });