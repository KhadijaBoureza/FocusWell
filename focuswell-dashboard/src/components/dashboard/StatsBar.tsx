import { CheckCircle2, Clock, Target, Flame } from "lucide-react";
import { Task } from "@/types/dashboard";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { mockTasks } from "@/data/mockData";

function StatsBar() {
  const [tasks] = useLocalStorage<Task[]>("kanban-tasks", mockTasks);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.column === "done").length;
  const inProgressTasks = tasks.filter((t) => t.column === "inprogress").length;

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: Target,
      color: "text-primary",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      color: "text-blue-500",
    },
    {
      label: "Completion",
      value: `${completionRate}%`,
      icon: Flame,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-4 flex items-center gap-3"
        >
          <stat.icon size={20} className={stat.color} />

          <div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsBar;