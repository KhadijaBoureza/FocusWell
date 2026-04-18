import { Trophy, CheckCircle2 } from "lucide-react";
import { allBadges } from "../../data/badges";
import { useAchievementStats } from "@/hooks/useAchievementStats";

const AchievementsPreview = () => {
  const { achievements, loading, error } = useAchievementStats();

  if (loading) {
    return (
      <div className="glass-card neon-border-violet p-5 h-full flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading achievements...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card neon-border-violet p-5 h-full flex items-center justify-center">
        <span className="text-sm text-red-500">Failed to load achievements.</span>
      </div>
    );
  }

  const unlockedIds = new Set(
    achievements.filter((a) => a.unlocked).map((a) => a.badgeId)
  );

  const unlocked = unlockedIds.size;
  const total = allBadges.length;

  const isEarned = (badge: typeof allBadges[0]) => {
    return unlockedIds.has(badge.id);
  };

  return (
    <div className="glass-card neon-border-violet p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Trophy size={16} className="text-primary" />
          </div>
          <h2 className="font-mono text-sm font-semibold text-foreground">Achievements</h2>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          {unlocked}/{total}
        </span>
      </div>

      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
          style={{ width: `${(unlocked / total) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-6 gap-2 flex-1 overflow-y-auto scrollbar-thin auto-rows-fr">
        {allBadges.map((badge) => {
          const earned = isEarned(badge);

          return (
            <div
              key={badge.id}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all duration-300 ${
                earned
                  ? `${badge.bgClass} ${badge.glowClass}`
                  : "bg-muted/10 border-border/30"
              }`}
              title={`${badge.title} — ${badge.description}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 ${
                  earned ? badge.bgClass : "bg-muted/20"
                }`}
              >
                <badge.icon
                  size={20}
                  className={earned ? badge.colorClass : "text-muted-foreground/40"}
                />
              </div>

              <span
                className={`text-[9px] font-mono leading-tight text-center w-full ${
                  earned ? "text-foreground font-bold" : "text-muted-foreground/40"
                }`}
              >
                {badge.title}
              </span>

              {earned && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle2 size={9} className="text-primary-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsPreview;