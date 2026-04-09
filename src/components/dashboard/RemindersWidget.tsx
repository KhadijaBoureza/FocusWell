import { useState, useEffect } from "react";
import { Bell, Plus, X, Check, Clock } from "lucide-react";

interface Reminder {
  _id: string;
  title: string;
  time: string;
  date: string;
  completed: boolean;
}

function RemindersWidget() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");

  // FETCH reminders
  useEffect(() => {
    fetch("http://localhost:5000/reminders")
      .then((res) => res.json())
      .then((data) => setReminders(data))
      .catch((err) => console.error(err));
  }, []);

  // ADD reminder
  async function addReminder() {
    if (!title.trim()) return;

    const res = await fetch("http://localhost:5000/reminders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        time,
        date: new Date().toISOString().split("T")[0],
      }),
    });

    const newReminder = await res.json();

    setReminders((prev) => [...prev, newReminder]);
    setTitle("");
    setTime("09:00");
    setIsAdding(false);
  }

  // TOGGLE completed
  async function toggleReminder(reminder: Reminder) {
    const res = await fetch(
      `http://localhost:5000/reminders/${reminder._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !reminder.completed,
        }),
      }
    );

    const updated = await res.json();

    setReminders((prev) =>
      prev.map((r) => (r._id === reminder._id ? updated : r))
    );
  }

  // DELETE reminder
  async function deleteReminder(id: string) {
    await fetch(`http://localhost:5000/reminders/${id}`, {
      method: "DELETE",
    });

    setReminders((prev) => prev.filter((r) => r._id !== id));
  }

  // SORT reminders
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
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Reminder..."
            className="flex-1 border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
          />

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border border-border rounded-md px-2 py-2 text-sm bg-background text-foreground"
          />

          <button
            onClick={addReminder}
            className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs hover:opacity-90"
          >
            Add
          </button>
        </div>
      )}

      {/* Reminder list */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto">
        {sortedReminders.map((reminder) => (
          <div
            key={reminder._id}
            className={`flex items-center gap-3 p-2.5 rounded-md group transition ${
              reminder.completed
                ? "opacity-50"
                : "hover:bg-muted/40"
            }`}
          >
            {/* Toggle checkbox */}
            <button
              onClick={() => toggleReminder(reminder)}
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
                {reminder.title}
              </p>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock size={10} />
              {reminder.time}
            </div>

            {/* Delete */}
            <button
              onClick={() => deleteReminder(reminder._id)}
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