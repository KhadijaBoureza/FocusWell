import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { allBadges, type Badge } from "@/data/badges";
import { useAchievementStats } from "@/hooks/useAchievementStats";

const motivations = [
  "You're on fire! Keep that momentum going. 🔥",
  "Small steps, big wins. Proud of you!",
  "Consistency is your superpower. Keep showing up.",
  "Look at you go — future-you is grateful.",
  "Progress, not perfection. You're crushing it!",
  "Every focused minute compounds. Keep building.",
  "You showed up today, and it paid off.",
  "Greatness is a habit. You're forming one.",
];

const STORAGE_KEY = "focuswell-earned-badges";

const BadgeCelebration = () => {
  const { achievements, loading } = useAchievementStats();
  const [seenIds, setSeenIds] = useLocalStorage<string[]>(STORAGE_KEY, []);

  const [queue, setQueue] = useState<Badge[]>([]);
  const [current, setCurrent] = useState<Badge | null>(null);
  const [motivation, setMotivation] = useState("");

  useEffect(() => {
    if (loading) return;

    const unlockedBadgeIds = achievements
      .filter((achievement) => achievement.unlocked)
      .map((achievement) => achievement.badgeId);

    const newlyUnlockedBadges = allBadges.filter(
      (badge) => unlockedBadgeIds.includes(badge.id) && !seenIds.includes(badge.id)
    );

    if (newlyUnlockedBadges.length > 0) {
      setQueue((prev) => [...prev, ...newlyUnlockedBadges]);
      setSeenIds((prev) => [
        ...prev,
        ...newlyUnlockedBadges.map((badge) => badge.id),
      ]);
    }
  }, [achievements, loading, seenIds, setSeenIds]);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setMotivation(motivations[Math.floor(Math.random() * motivations.length)]);
      setQueue((prev) => prev.slice(1));
    }
  }, [queue, current]);

  const handleClose = () => setCurrent(null);

  if (!current) return null;

  const Icon = current.icon;

  return (
    <Dialog open={!!current} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-sm text-center glass-card neon-border-violet">
        <div className="flex flex-col items-center gap-4 pt-2">
          <div className="relative">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center ${current.bgClass} ${current.glowClass} animate-scale-in`}
            >
              <Icon size={40} className={current.colorClass} />
            </div>

            <Sparkles
              size={18}
              className="absolute -top-1 -right-1 text-primary animate-pulse"
            />
            <Sparkles
              size={14}
              className="absolute -bottom-1 -left-2 text-accent animate-pulse"
            />
          </div>

          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Badge Unlocked
            </p>
            <DialogTitle className="font-mono text-2xl">
              {current.title}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {current.description}
            </DialogDescription>
          </div>

          <p className="text-sm text-foreground/90 italic px-2">{motivation}</p>

          <button
            onClick={handleClose}
            className="mt-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Keep going
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeCelebration;