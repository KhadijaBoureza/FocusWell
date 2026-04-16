import { Trophy, CheckCircle2 } from "lucide-react";
import { allBadges, getBadgeStats, getUnlockedCount } from "../../data/badges";
import { useAchievementStats } from "@/hooks/useAchievementStats";

const AchievementBadges = () => {
  const { data, loading, error } = useAchievementStats();

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading achievements...</div>;
  }

  if (error || !data) {
    return <div className="p-6 text-red-500">Failed to load achievements.</div>;
  }

  const stats = getBadgeStats(data);
  const { unlocked, total, legendUnlocked } = getUnlockedCount(stats);

  const isEarned = (badge: typeof allBadges[0]) => {
    if (badge.id === "legend") return legendUnlocked;
    return badge.check(stats);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card neon-border-violet p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Trophy size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="font-mono text-lg font-bold text-foreground">Achievement Badges</h2>
            <p className="text-xs text-muted-foreground">
              {unlocked} of {total} unlocked
            </p>
          </div>
        </div>

        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
            style={{ width: `${(unlocked / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {allBadges.map((badge) => {
          const earned = isEarned(badge);

          return (
            <div
              key={badge.id}
              className={`relative p-4 rounded-xl border text-center transition-all duration-300 ${
                earned
                  ? `${badge.bgClass} ${badge.glowClass}`
                  : "bg-muted/10 border-border/30"
              }`}
            >
              <div
                className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  earned ? badge.bgClass : "bg-muted/20"
                }`}
              >
                <badge.icon
                  size={24}
                  className={earned ? badge.colorClass : "text-muted-foreground/40"}
                />
              </div>

              <h3
                className={`font-mono text-xs font-bold mb-1 ${
                  earned ? "text-foreground" : "text-muted-foreground/50"
                }`}
              >
                {badge.title}
              </h3>

              <p
                className={`text-[10px] leading-tight ${
                  earned ? "text-muted-foreground" : "text-muted-foreground/40"
                }`}
              >
                {badge.description}
              </p>

              {earned && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-primary-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementBadges;