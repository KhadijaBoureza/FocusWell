import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BarChart3, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function WeeklyAnalytics() {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
       const pomodoro = await api.getPomodoro();
        const tasks = await api.getTasks();

        // create last 7 days
        const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        const last7Days: any[] = [];

        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);

          last7Days.push({
            date: d.toISOString().split("T")[0],
            day: days[d.getDay()],
            focus: 0,
            tasks: 0,
          });
        }

        // 🧠 MAP FOCUS DATA
        pomodoro.sessions.forEach((s: any) => {
          const date = new Date(s.completedAt).toISOString().split("T")[0];

          const found = last7Days.find((d) => d.date === date);
          if (found) {
            found.focus += s.duration / 60;
          }
        });

        // 🧠 MAP TASK DATA
        tasks.forEach((task: any) => {
          if (task.column !== "done") return;

          const date = task.createdAt;

          const found = last7Days.find((d) => d.date === date);
          if (found) {
            found.tasks += 1;
          }
        });

        setWeeklyData(last7Days);

      } catch (err) {
        console.log("Analytics load failed", err);
      }
    };

    loadData();
  }, []);

  const totalFocus = weeklyData.reduce((s, d) => s + d.focus, 0);
  const totalTasks = weeklyData.reduce((s, d) => s + d.tasks, 0);
  const avgFocus = (totalFocus / 7 || 0).toFixed(1);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">Weekly Summary</h2>
        </div>

        <div className="flex items-center gap-1 text-xs text-green-500">
          <TrendingUp size={14} />
          Live Data
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3 rounded-lg bg-muted/40">
          <p className="text-xl font-bold">{totalFocus.toFixed(1)}h</p>
          <p className="text-xs text-muted-foreground uppercase">
            Focus Time
          </p>
        </div>

        <div className="text-center p-3 rounded-lg bg-muted/40">
          <p className="text-xl font-bold">{totalTasks}</p>
          <p className="text-xs text-muted-foreground uppercase">
            Tasks Done
          </p>
        </div>

        <div className="text-center p-3 rounded-lg bg-muted/40">
          <p className="text-xl font-bold">{avgFocus}h</p>
          <p className="text-xs text-muted-foreground uppercase">
            Daily Avg
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} barGap={4}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={25}
            />

            <Tooltip />

            <Bar
              dataKey="focus"
              name="Focus (hrs)"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="tasks"
              name="Tasks"
              fill="hsl(var(--secondary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default WeeklyAnalytics;