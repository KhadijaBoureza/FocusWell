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

const weeklyData = [
  { day: "Mon", focus: 4, tasks: 6 },
  { day: "Tue", focus: 6, tasks: 8 },
  { day: "Wed", focus: 3, tasks: 4 },
  { day: "Thu", focus: 7, tasks: 9 },
  { day: "Fri", focus: 5, tasks: 7 },
  { day: "Sat", focus: 2, tasks: 3 },
  { day: "Sun", focus: 1, tasks: 2 },
];

function WeeklyAnalytics() {
  const totalFocus = weeklyData.reduce((s, d) => s + d.focus, 0);
  const totalTasks = weeklyData.reduce((s, d) => s + d.tasks, 0);
  const avgFocus = (totalFocus / 7).toFixed(1);

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
          +12%
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3 rounded-lg bg-muted/40">
          <p className="text-xl font-bold">{totalFocus}h</p>
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

            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(var(--foreground))",
              }}
            />

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