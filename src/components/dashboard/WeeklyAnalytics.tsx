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
import { Task } from "@/types/dashboard";

type WeeklyDataItem = {
  date: string;
  day: string;
  focus: number;
  tasks: number;
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

function WeeklyAnalytics() {
  const [weeklyData, setWeeklyData] = useState<WeeklyDataItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const pomodoro = await api.getPomodoro();
        const tasks: Task[] = await api.getTasks();

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

        // MAP FOCUS DATA
        pomodoro.sessions.forEach((s: any) => {
          if (!s.completedAt) return;

          const date = new Date(s.completedAt).toISOString().split("T")[0];
          const found = last7Days.find((d) => d.date === date);

          if (found) {
            found.focus += s.duration / 60;
          }
        });

        // MAP TASK DATA
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
  }, []);

  const totalFocus = weeklyData.reduce((sum, day) => sum + day.focus, 0);
  const totalTasks = weeklyData.reduce((sum, day) => sum + day.tasks, 0);
  const avgFocus = (totalFocus / 7 || 0).toFixed(1);
  const taskTrend = calculateDailyTrend(weeklyData);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">Weekly Summary</h2>
        </div>

        <div
          className={`flex items-center gap-1 text-xs ${
            taskTrend >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          <TrendingUp size={14} />
          {taskTrend >= 0 ? "+" : ""}
          {taskTrend}%
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-muted/40 p-3 text-center">
          <p className="text-xl font-bold">{totalFocus.toFixed(1)}h</p>
          <p className="text-xs uppercase text-muted-foreground">Focus Time</p>
        </div>

        <div className="rounded-lg bg-muted/40 p-3 text-center">
          <p className="text-xl font-bold">{totalTasks}</p>
          <p className="text-xs uppercase text-muted-foreground">Tasks Done</p>
        </div>

        <div className="rounded-lg bg-muted/40 p-3 text-center">
          <p className="text-xl font-bold">{avgFocus}h</p>
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