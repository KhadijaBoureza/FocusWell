import { useCallback, useEffect, useState } from "react";

type AchievementStatsResponse = {
  sessions: number;
  minutes: number;
  breaks: number;
  kanban: any[];
  notes: any[];
  thoughts: any[];
  reminders: any[];
};

type UserAchievement = {
  _id: string;
  badgeId: string;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
};

export const useAchievementStats = () => {
  const [data, setData] = useState<AchievementStatsResponse | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setError("");

      const [statsRes, achievementsRes] = await Promise.all([
        fetch("http://localhost:5000/achievements/stats"),
        fetch("http://localhost:5000/achievements"),
      ]);

      if (!statsRes.ok) throw new Error("Failed to fetch achievement stats");
      if (!achievementsRes.ok) throw new Error("Failed to fetch achievements");

      const statsJson = await statsRes.json();
      const achievementsJson = await achievementsRes.json();

      setData(statsJson);
      setAchievements(achievementsJson);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    data,
    achievements,
    loading,
    error,
    refetchAchievements: fetchData,
  };
};