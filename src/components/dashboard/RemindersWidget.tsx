import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Plus,
  X,
  Check,
  Clock,
  CalendarPlus,
  CalendarDays,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface Reminder {
  _id: string;
  title: string;
  time: string;
  date: string;
  completed: boolean;
}

interface EventItem {
  _id?: string;
  id?: string;
  title: string;
  date: string;
  time: string;
  type: "meeting" | "interview" | "schedule" | "event";
}

function RemindersWidget() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const timeInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/reminders")
      .then((res) => res.json())
      .then((data) => setReminders(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error(err));
  }, []);

  function formatDisplayDate(dateStr: string) {
    try {
      const d = new Date(dateStr + "T00:00:00");
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      if (d.toDateString() === today.toDateString()) return "Today";
      if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";

      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  function formatDisplayTime(timeStr: string) {
    try {
      const [h, m] = timeStr.split(":").map(Number);
      const ampm = h >= 12 ? "PM" : "AM";
      const hour = h % 12 || 12;
      return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
    } catch {
      return timeStr;
    }
  }

  function isPastReminder(dateStr: string, timeStr: string) {
    const reminderDateTime = new Date(`${dateStr}T${timeStr}:00`);
    const now = new Date();

    return reminderDateTime < now;
  }

  function isPastDate(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inputDate = new Date(dateStr + "T00:00:00");
  inputDate.setHours(0, 0, 0, 0);

  return inputDate < today;
}

  async function addReminder() {
    setError("");

    if (!title.trim()) {
      setError("Please enter a reminder title.");
      return;
    }

    if (isPastDate(selectedDate)) {
      setError("Invalid reminder date. Please choose today or a future date.");
      return;
    }

    if (isPastReminder(selectedDate, time)) {
      setError("Invalid reminder time. Please choose a future time.");
      return;
    }

    const res = await fetch("http://localhost:5000/reminders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        time,
        date: selectedDate,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to add reminder. Please try again.");
      return;
    }

    setReminders((prev) => [...prev, data]);
    setTitle("");
    setTime("09:00");
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setIsAdding(false);

    window.dispatchEvent(new CustomEvent("reminders:changed"));
  }

  async function toggleReminder(reminder: Reminder) {
    const res = await fetch(`http://localhost:5000/reminders/${reminder._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completed: !reminder.completed,
      }),
    });

    const updated = await res.json();

    setReminders((prev) =>
      prev.map((r) => (r._id === reminder._id ? updated : r))
    );

    window.dispatchEvent(new CustomEvent("reminders:changed"));
  }

  async function deleteReminder(id: string) {
    await fetch(`http://localhost:5000/reminders/${id}`, {
      method: "DELETE",
    });

    setReminders((prev) => prev.filter((r) => r._id !== id));
    window.dispatchEvent(new CustomEvent("reminders:changed"));
  }

  function isInCalendar(reminder: Reminder) {
    return events.some(
      (event) =>
        event.title === reminder.title &&
        event.date === reminder.date &&
        event.time === reminder.time
    );
  }

  async function addToCalendar(reminder: Reminder) {
    if (isInCalendar(reminder)) return;

    const res = await fetch("http://localhost:5000/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: reminder.title,
        date: reminder.date,
        time: reminder.time,
        type: "schedule",
      }),
    });

    const savedEvent = await res.json();
    setEvents((prev) => [...prev, savedEvent]);

    window.dispatchEvent(
      new CustomEvent("calendar:event-added", {
        detail: {
          ...savedEvent,
          id: savedEvent.id || savedEvent._id,
        },
      })
    );
  }

  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;

    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;

    return a.time.localeCompare(b.time);
  });

  return (

    <div className="glass-card neon-border-blue p-6 h-[393px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-primary" />
          <h2 className="font-mono text-lg font-semibold text-foreground">
            Reminders
          </h2>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {isAdding && (
        <div className="mb-4 p-3 bg-muted/30 rounded-lg space-y-3 border border-border/50">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addReminder()}
            placeholder="What do you need to remember?"
            className="w-full bg-background/50 border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="flex gap-2 items-center flex-wrap">
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-primary/40 bg-background/60 px-3 py-2 text-xs font-mono text-foreground shadow-[0_0_12px_rgba(168,85,247,0.08)] transition-all hover:border-primary/70 hover:bg-muted/40"
                >
                  <CalendarDays size={13} className="text-primary" />
                  {formatDisplayDate(selectedDate)}
                </button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
                <Calendar
                  mode="single"
                  selected={new Date(selectedDate + "T00:00:00")}
                  onSelect={(date) => {
                    if (!date) return;

                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    setSelectedDate(`${year}-${month}-${day}`);
                    setError("");
                    setDatePickerOpen(false);
                  }}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <div className="relative">
              <div className="flex items-center gap-2 rounded-xl border border-cyan-400/50 bg-background/60 px-3 py-2 text-xs font-mono text-foreground shadow-[0_0_12px_rgba(34,211,238,0.10)] transition-all hover:border-cyan-400/80 hover:bg-muted/40">
                <Clock size={13} className="text-cyan-400" />
                {formatDisplayTime(time)}
              </div>

              <input
                ref={timeInputRef}
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  setError("");
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>

            <button
              onClick={addReminder}
              disabled={!title.trim()}
              className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary/20 text-primary text-xs font-mono hover:bg-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={13} />
              Add
            </button>
          </div>
          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
      )}

      <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin flex-1">
        {sortedReminders.map((reminder) => (
          <div
            key={reminder._id}
            className={`flex items-start gap-3 p-2.5 rounded-md transition-all group ${reminder.completed ? "opacity-50" : "hover:bg-muted/30"
              }`}
          >
            <button
              onClick={() => toggleReminder(reminder)}
              className={`shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all ${reminder.completed
                ? "border-neon-green bg-neon-green/20"
                : "border-muted-foreground hover:border-primary"
                }`}
            >
              {reminder.completed && (
                <Check size={12} className="text-neon-green" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p
                className={`text-sm ${reminder.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
                  }`}
              >
                {reminder.title}
              </p>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-muted/40 px-1.5 py-0.5 rounded">
                  <CalendarDays size={9} />
                  {formatDisplayDate(reminder.date)}
                </span>

                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-muted/40 px-1.5 py-0.5 rounded">
                  <Clock size={9} />
                  {formatDisplayTime(reminder.time)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {!reminder.completed && (
                <button
                  onClick={() => addToCalendar(reminder)}
                  title={
                    isInCalendar(reminder)
                      ? "Already in calendar"
                      : "Add to calendar"
                  }
                  className={`p-1 rounded transition-all ${isInCalendar(reminder)
                    ? "text-primary opacity-60 cursor-default"
                    : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary"
                    }`}
                  disabled={isInCalendar(reminder)}
                >
                  <CalendarPlus size={14} />
                </button>
              )}

              <button
                onClick={() => deleteReminder(reminder._id)}
                className="p-1 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}

        {sortedReminders.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground font-mono">
            No reminders yet
          </div>
        )}
      </div>
    </div>
  );
}

export default RemindersWidget;