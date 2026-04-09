import { useState, useEffect } from "react"

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

function Index() {

  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error(err));
  }, []);
  const [activeTab, setActiveTab] = useState("dashboard");

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
          <div className="max-w-md mx-auto">
            <PomodoroTimer />
          </div>
        );

      case "calendar":
        return (
          <div className="max-w-md mx-auto">
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
        return <WeeklyAnalytics />;

      default:
        return (
          <div className="space-y-6">
            <StatsBar tasks={tasks} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <KanbanBoard tasks={tasks} setTasks={setTasks} />
              </div>

              <div className="space-y-6">
                <PomodoroTimer />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CalendarWidget />
              <NotesWidget />

              <div className="space-y-6">
                <RemindersWidget />
                <ThoughtOrganizer />
              </div>
            </div>

            <WeeklyAnalytics />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col">
        <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Header */}
        <header className="flex items-center justify-between p-4 md:p-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              {activeTab === "dashboard" ? (
                <>
                  {greeting} c
                </>
              ) : (
                <span className="capitalize">
                  {activeTab === "analytics"
                    ? "Weekly Analytics"
                    : activeTab}
                </span>
              )}
            </h1>

            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === "dashboard"
                ? "Here's your productivity overview"
                : "Stay focused and productive"}
            </p>
          </div>

          <ThemeToggle />
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 md:px-6 pb-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default Index;