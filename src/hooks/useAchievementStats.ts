import { useEffect, useState } from "react";

type AchievementStatsResponse = {
  sessions: number;
  minutes: number;
  breaks: number;
  kanban: any[];
  notes: any[];
  thoughts: any[];
  reminders: any[];
};

export const useAchievementStats = () => {
  const [data, setData] = useState<AchievementStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const res = await fetch("http://localhost:5000/achievements/stats");

        if (!res.ok) {
          throw new Error("Failed to fetch achievement stats");
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { data, loading, error };
};