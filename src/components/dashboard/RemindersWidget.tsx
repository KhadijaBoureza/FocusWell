import { useState } from "react";
import { Bell, Plus, X, Check, Clock } from "lucide-react";
import { Reminder } from "@/types/dashboard";
import { mockReminders } from "@/data/mockData";
import { useLocalStorage } from "@/hooks/useLocalStorage";

function RemindersWidget() {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>(
    "dashboard-reminders",
    mockReminders
  );

  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState("");
  const [time, setTime] = useState("09:00");

  function addReminder() {
    if (!text.trim()) return;

    const reminder: Reminder = {
      id: Date.now().toString(),
      text,
      time,
      date: new Date().toISOString().split("T")[0],
      completed: false,
    };

    setReminders([...reminders, reminder]);
    setText("");
    setTime("09:00");
    setIsAdding(false);
  }

  function toggleReminder(id: string) {
    setReminders(
      reminders.map((r) =>
        r.id === id ? { ...r, completed: !r.completed } : r
      )
    );
  }

  function deleteReminder(id: string) {
    setReminders(reminders.filter((r) => r.id !== id));
  }

  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.time.localeCompare(b.time);
  });

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">Reminders</h2>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {/* Add Reminder */}
      {isAdding && (
        <div className="mb-4 flex gap-2 items-end p-3 bg-muted/40 rounded-lg">
          <div className="flex-1">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addReminder()}
              placeholder="Reminder..."
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border border-border rounded-md px-2 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <button
            onClick={addReminder}
            className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs hover:opacity-90 transition"
          >
            Add
          </button>
        </div>
      )}

      {/* Reminder list */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto">
        {sortedReminders.map((reminder) => (
          <div
            key={reminder.id}
            className={`flex items-center gap-3 p-2.5 rounded-md group transition ${
              reminder.completed
                ? "opacity-50"
                : "hover:bg-muted/40"
            }`}
          >
            {/* Toggle */}
            <button
              onClick={() => toggleReminder(reminder.id)}
              className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                reminder.completed
                  ? "border-green-500 bg-green-500/20"
                  : "border-muted-foreground hover:border-primary"
              }`}
            >
              {reminder.completed && (
                <Check size={12} className="text-green-500" />
              )}
            </button>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm ${
                  reminder.completed
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {reminder.text}
              </p>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock size={10} />
              {reminder.time}
            </div>

            {/* Delete */}
            <button
              onClick={() => deleteReminder(reminder.id)}
              className="p-1 text-destructive opacity-0 group-hover:opacity-100 transition"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RemindersWidget;