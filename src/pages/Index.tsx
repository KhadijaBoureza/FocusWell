import { useState, useEffect } from "react";

import { Task } from "@/types/dashboard";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import MobileNav from "../components/dashboard/MobileNav";
import ThemeToggle from "../components/dashboard/ThemeToggle";
import StatsBar from "../components/dashboard/StatsBar";
import KanbanBoard from "../components/dashboard/KanbanBoard";
import PomodoroTimer from "../components/dashboard/PomodoroTimer";
import CalendarWidget from "../components/dashboard/CalendarWidget";
import NotesWidget from "../components/dashboard/NotesWidget";
import RemindersWidget from "../components/dashboard/RemindersWidget";
import ThoughtOrganizer from "../components/dashboard/ThoughtOrganizer";
import WeeklyAnalytics from "../components/dashboard/WeeklyAnalytics";
import AchievementBadges from "@/components/dashboard/AchievementBadges";
import AchievementsPreview from "@/components/dashboard/AchievementsPreview";

function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/tasks");
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadTasks();

    const interval = setInterval(() => {
      loadTasks();
      setAnalyticsRefreshKey((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const hour = new Date().getHours();

  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  const renderContent = () => {
    switch (activeTab) {
      case "tasks":
        return <KanbanBoard tasks={tasks} setTasks={setTasks} />;

      case "timer":
        return (
          <div className="mx-auto max-w-md">
            <PomodoroTimer />
          </div>
        );

      case "calendar":
        return (
          <div className="mx-auto max-w-md">
            <CalendarWidget />
          </div>
        );

      case "notes":
        return <NotesWidget />;

      case "thoughts":
        return <ThoughtOrganizer />;

      case "reminders":
        return <RemindersWidget />;

      case "analytics":
        return (
          <WeeklyAnalytics
            tasks={tasks}
            refreshKey={analyticsRefreshKey}
          />
        );

      case "achievements":
        return <AchievementBadges />;

      default:
        return (
          <div className="space-y-6">
            <StatsBar tasks={tasks} />

            {/* Keep tasks + timer exactly as before */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <KanbanBoard tasks={tasks} setTasks={setTasks} />
              </div>

              <div className="space-y-6">
                <PomodoroTimer />
              </div>
            </div>

            {/* New dashboard layout below */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Top row */}
              <div className="lg:col-span-4">
                <CalendarWidget />
              </div>

              <div className="lg:col-span-4">
                <NotesWidget />
              </div>

              <div className="lg:col-span-4">
                <RemindersWidget />
              </div>

              {/* Bottom row */}
              <div className="lg:col-span-8">
                <AchievementsPreview />
              </div>

              <div className="lg:col-span-4">
                <ThoughtOrganizer />
              </div>
            </div>

            <WeeklyAnalytics
              tasks={tasks}
              refreshKey={analyticsRefreshKey}
            />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex flex-1 flex-col">
        <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

        <header className="flex items-center justify-between p-4 md:p-6">
          <div>
            <h1 className="text-xl font-bold md:text-2xl">
              {activeTab === "dashboard" ? (
                <>{greeting} c</>
              ) : (
                <span className="capitalize">
                  {activeTab === "analytics"
                    ? "Weekly Analytics"
                    : activeTab}
                </span>
              )}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {activeTab === "dashboard"
                ? "Here's your productivity overview"
                : "Stay focused and productive"}
            </p>
          </div>

          <ThemeToggle />
        </header>

        <main className="flex-1 px-4 pb-8 md:px-6">{renderContent()}</main>
      </div>
    </div>
  );
}

export default Index;