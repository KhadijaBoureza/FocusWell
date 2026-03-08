import { useState } from "react";
import { Menu, X } from "lucide-react";
import {
  LayoutDashboard,
  ListTodo,
  Clock,
  Calendar,
  StickyNote,
  Bell,
  Brain,
  BarChart3,
} from "lucide-react";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "timer", label: "Timer", icon: Clock },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "thoughts", label: "Thoughts", icon: Brain },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top mobile bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <LayoutDashboard size={14} className="text-primary" />
          </div>

          <span className="text-sm font-semibold">FocusWell</span>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="p-2 text-muted-foreground hover:text-foreground"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Dropdown navigation */}
      {open && (
        <div className="md:hidden absolute top-14 left-0 right-0 z-50 border-b border-border bg-background p-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === item.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

export default MobileNav;