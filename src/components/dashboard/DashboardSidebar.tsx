import { useState } from "react";
import {
  LayoutDashboard,
  ListTodo,
  Clock,
  Calendar,
  StickyNote,
  Bell,
  Brain,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Heart,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "timer", label: "Focus Timer", icon: Clock },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "thoughts", label: "Thoughts", icon: Brain },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "wellbeing", label: "Wellbeing", icon: Heart },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "achievements", label: "Achievements", icon: Trophy },
];

const DashboardSidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0 transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="p-4 flex items-center gap-2 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center neon-glow-violet">
          <LayoutDashboard size={16} className="text-primary" />
        </div>
        {!collapsed && (
          <span className="font-mono text-base font-bold neon-text-violet">
            FocusWell
          </span>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              activeTab === item.id
                ? "bg-primary/15 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary transition-all duration-300 relative group"
        >
          <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/10 blur-sm"></span>

          {collapsed ? (
            <ChevronRight size={16} className="relative z-10" />
          ) : (
            <ChevronLeft size={16} className="relative z-10" />
          )}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;