import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Task } from "@/types/dashboard";
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

type WeeklyDataItem = {
  date: string;
  day: string;
  focus: number;
  tasks: number;
};

type WeeklyAnalyticsProps = {
  tasks: Task[];
  refreshKey: number;
};

function calculateDailyTrend(data: WeeklyDataItem[]) {
  if (data.length < 2) return 0;

  const yesterday = data[data.length - 2];
  const today = data[data.length - 1];

  const yesterdayTasks = yesterday.tasks;
  const todayTasks = today.tasks;

  if (yesterdayTasks === 0) {
    return todayTasks > 0 ? 100 : 0;
  }

  return Math.round(((todayTasks - yesterdayTasks) / yesterdayTasks) * 100);
}

function formatFocus(minutes: number) {
  const safeMinutes = Math.max(0, Math.round(minutes));

  if (safeMinutes <= 0) return "0m";

  if (safeMinutes < 60) {
    return safeMinutes + "m";
  }

  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;

  return mins === 0 ? hours + "h" : `${hours}h ${mins}m`;
}

function WeeklyAnalytics({ tasks, refreshKey }: WeeklyAnalyticsProps) {
  const [weeklyData, setWeeklyData] = useState<WeeklyDataItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const pomodoro = await api.getPomodoro();

        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const last7Days: WeeklyDataItem[] = [];

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

        pomodoro.sessions.forEach((s: any) => {
          if (!s.completedAt) return;

          const date = new Date(s.completedAt).toISOString().split("T")[0];
          const found = last7Days.find((d) => d.date === date);

          if (found) {
            found.focus += s.duration < 1 ? s.duration * 60 : s.duration;
          }
        });

        tasks.forEach((task) => {
          if (task.column !== "done" || !task.completedAt) return;

          const date = new Date(task.completedAt).toISOString().split("T")[0];
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
  }, [tasks, refreshKey]);

  const totalFocus = weeklyData.reduce((sum, day) => sum + day.focus, 0);
  const totalTasks = weeklyData.reduce((sum, day) => sum + day.tasks, 0);
  const avgFocus = (totalFocus / 7 || 0).toFixed(2);
  const taskTrend = calculateDailyTrend(weeklyData);
  const trendPct = calculateDailyTrend(weeklyData);

  return (
    <div className="glass-card neon-border-blue p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">Weekly Summary</h2>
        </div>

        <div className="text-right">
          <div
            className={`flex items-center justify-end gap-1 text-xs ${
              taskTrend >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            <TrendingUp size={14} />
            {taskTrend >= 0 ? "+" : ""}
            {taskTrend}%
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
             Daily Task Trend
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-muted/40 p-3 text-center">
          <p className="text-xl font-bold">{String(formatFocus(totalFocus))}</p>
          <p className="text-xs uppercase text-muted-foreground">Focus Time</p>
        </div>

        <div className="rounded-lg bg-muted/40 p-3 text-center">
          <p className="text-xl font-bold">{totalTasks}</p>
          <p className="text-xs uppercase text-muted-foreground">Tasks Done</p>
        </div>

        <div className="rounded-lg bg-muted/40 p-3 text-center">
          <p className="text-xl font-bold">
            {String(formatFocus(Math.ceil(totalFocus / 7)))}
          </p>
          <p className="text-xs uppercase text-muted-foreground">Daily Avg</p>
        </div>
      </div>

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

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background) / 0.85)",
                border: "1px solid hsl(var(--primary) / 0.3)",
                boxShadow: "0 0 12px hsl(var(--primary) / 0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
              }}
              labelStyle={{
                color: "hsl(var(--foreground))",
                fontSize: "12px",
              }}
              itemStyle={{
                color: "hsl(var(--foreground))",
                fontSize: "12px",
              }}
              cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
              formatter={(value: number, name: string) => {
                if (name === "Focus") {
                  return [formatFocus(value), name];
                }
                return [value, name];
              }}
            />

            <Bar
              dataKey="focus"
              name="Focus"
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