import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  ArrowRight,
  Lock,
  LayoutDashboard,
  Calendar,
  ListTodo,
  StickyNote,
  Brain,
  Trophy,
} from "lucide-react";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileNav from "@/components/dashboard/MobileNav";
import ThemeToggle from "@/components/dashboard/ThemeToggle";
import { Button } from "@/components/ui/button";

function Demo() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 flex flex-col relative">
        <MobileNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Header */}
        <header className="p-4 md:p-6 flex items-center justify-between border-b border-border">
          <div>
            <h1 className="font-mono text-xl md:text-2xl font-bold text-foreground">
              FocusWell{" "}
              <span className="neon-text-violet">Demo</span>
            </h1>

            <p className="text-sm text-muted-foreground mt-0.5">
              Explore the dashboard interface preview.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => navigate("/auth")}
              className="gap-2"
            >
              Sign in <ArrowRight size={14} />
            </Button>

            <ThemeToggle />
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 px-4 md:px-6 py-6 space-y-6">
          {/* Demo Banner */}
          <div className="glass-card p-4 border border-primary/30 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <Eye size={18} className="text-primary" />
              </div>

              <div>
                <h2 className="font-medium text-foreground">
                  Demo Preview Mode
                </h2>

                <p className="text-sm text-muted-foreground">
                  No personal or saved user data is shown.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
            >
              Create account
            </Button>
          </div>

          {/* Fake Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: ListTodo,
                title: "Tasks",
                value: "0",
              },
              {
                icon: Calendar,
                title: "Events",
                value: "0",
              },
              {
                icon: Trophy,
                title: "Badges",
                value: "0",
              },
              {
                icon: Brain,
                title: "Focus",
                value: "0h",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="glass-card p-5"
              >
                <item.icon
                  size={18}
                  className="text-primary mb-3"
                />

                <div className="font-mono text-2xl font-bold">
                  {item.value}
                </div>

                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  {item.title}
                </div>
              </div>
            ))}
          </div>

          {/* Preview Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tasks */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <LayoutDashboard
                    size={18}
                    className="text-primary"
                  />

                  <h2 className="font-mono text-lg font-bold">
                    Task Board
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["To Do", "In Progress", "Done"].map((col) => (
                    <div
                      key={col}
                      className="rounded-xl border border-border bg-background/40 p-4 min-h-[180px]"
                    >
                      <div className="font-medium text-sm mb-3">
                        {col}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        No tasks available in demo mode.
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <StickyNote
                    size={18}
                    className="text-primary"
                  />

                  <h2 className="font-mono text-lg font-bold">
                    Notes Preview
                  </h2>
                </div>

                <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground text-sm">
                  Sign in to create and save notes.
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="space-y-6">
              {/* Timer */}
              <div className="glass-card p-6 text-center">
                <h2 className="font-mono text-lg font-bold mb-4">
                  Focus Timer
                </h2>

                <div className="text-5xl font-mono font-bold text-primary mb-2">
                  25:00
                </div>

                <p className="text-sm text-muted-foreground">
                  Pomodoro preview mode
                </p>
              </div>

              {/* Locked */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock
                    size={18}
                    className="text-primary"
                  />

                  <h2 className="font-mono text-lg font-bold">
                    Private Features
                  </h2>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Journals, analytics, reminders and wellbeing
                  tracking are available after sign in.
                </p>

                <Button
                  className="w-full gap-2"
                  onClick={() => navigate("/auth")}
                >
                  Sign in now <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Demo;



