import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Task } from "@/types/dashboard";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import ThemeToggle from "../components/dashboard/ThemeToggle";
import MobileNav from "../components/dashboard/MobileNav";
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
import WellbeingTracker from "@/components/dashboard/WellbeingTracker";
import MoodCheckInCompact from "@/components/dashboard/MoodCheckInCompact";
import BadgeCelebration from "@/components/dashboard/BadgeCelebration";

function Index() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0);

  const handleLogout = async () => {
    const token = localStorage.getItem("focuswell-token");

    try {
      if (token) {
        await fetch("http://localhost:5000/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("focuswell-token");
      localStorage.removeItem("focuswell-user");
      navigate("/auth");
    }
  };

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
  const userName = "there";

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

      case "wellbeing":
        return <WellbeingTracker onNavigate={setActiveTab} />;

      case "analytics":
        return <WeeklyAnalytics tasks={tasks} refreshKey={analyticsRefreshKey} />;

      case "achievements":
        return <AchievementBadges />;

      default:
        return (
          <div className="space-y-6">
            <StatsBar tasks={tasks} />

            <MoodCheckInCompact onNavigate={setActiveTab} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <KanbanBoard tasks={tasks} setTasks={setTasks} />
              </div>

              <div>
                <PomodoroTimer />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CalendarWidget />
              <NotesWidget />
              <RemindersWidget />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AchievementsPreview />
              </div>

              <div>
                <ThoughtOrganizer />
              </div>
            </div>

            <WeeklyAnalytics tasks={tasks} refreshKey={analyticsRefreshKey} />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex flex-1 flex-col">
        <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

        <header className="p-4 md:p-6 flex items-center justify-between">
          <div>
            <h1 className="font-mono text-xl md:text-2xl font-bold text-foreground">
              {activeTab === "dashboard" ? (
                <>
                  {greeting}, {userName}{" "}
                  <span className="neon-text-violet">👋</span>
                </>
              ) : (
                <span className="capitalize">
                  {activeTab === "analytics" ? "Weekly Analytics" : activeTab}
                </span>
              )}
            </h1>

            <p className="text-sm text-muted-foreground mt-0.5">
              {activeTab === "dashboard"
                ? "Welcome to your mind's command center"
                : "Stay focused, stay well"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut size={14} />
              <span className="hidden sm:inline">Log out</span>
            </Button>

            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 pb-8 md:px-6">{renderContent()}</main>
      </div>

      <BadgeCelebration />
    </div>
  );
}

export default Index;