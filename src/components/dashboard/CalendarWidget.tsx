import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Clock, Tag } from "lucide-react";
// import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type EventType = "meeting" | "interview" | "schedule" | "event";

interface CalendarEvent {
  _id: string; // ✅ FIXED (was id)
  title: string;
  date: string;
  time: string;
  type: EventType;
}

const EVENT_COLORS: Record<EventType, string> = {
  meeting: "bg-primary/80",
  interview: "bg-accent",
  schedule: "bg-secondary",
  event: "bg-muted",
};

const EVENT_LABELS: Record<EventType, string> = {
  meeting: "Meeting",
  interview: "Interview",
  schedule: "Schedule",
  event: "Event",
};

const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // const [events, setEvents] = useLocalStorage<CalendarEvent[]>("focuswell-events", []);
  const [events, setEvents] = useState<CalendarEvent[]>([]); // ✅ NEW

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDayEvents, setShowDayEvents] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", time: "09:00", type: "meeting" as EventType });

  // ✅ FETCH EVENTS FROM BACKEND
  useEffect(() => {
    fetch("http://localhost:5000/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error(err));
  }, []);

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const dateKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getEventsForDay = (day: number) =>
    events.filter((e) => e.date === dateKey(day));

  const handleDayClick = (day: number) => {
    setSelectedDate(dateKey(day));
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length > 0) {
      setShowDayEvents(true);
    } else {
      setShowAddDialog(true);
    }
  };

  // ✅ ADD EVENT → BACKEND
  async function handleAddEvent() {
    if (!newEvent.title.trim() || !selectedDate) return;

    const res = await fetch("http://localhost:5000/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newEvent.title,
        date: selectedDate,
        time: newEvent.time,
        type: newEvent.type,
      }),
    });

    const savedEvent = await res.json();

    setEvents((prev) => [...prev, savedEvent]);

    setNewEvent({ title: "", time: "08:00", type: "meeting" });
    setShowAddDialog(false);
  }

  // ❌ OLD
  // const handleDeleteEvent = (id: string) => {
  //   setEvents(events.filter((e) => e.id !== id));
  // };

  // ✅ NEW DELETE
  async function handleDeleteEvent(id: string) {
    await fetch(`http://localhost:5000/events/${id}`, {
      method: "DELETE",
    });

    setEvents((prev) => prev.filter((e) => e._id !== id));
  }

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const selectedDateEvents = selectedDate
    ? events.filter((e) => e.date === selectedDate)
    : [];

  const selectedDateFormatted = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <>
      <div className="glass-card neon-border-violet p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-lg font-semibold text-foreground">
            Calendar
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedDate(dateKey(today.getDate()));
                setShowAddDialog(true);
              }}
              className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus size={16} />
            </button>

            <button onClick={prevMonth}>
              <ChevronLeft size={18} />
            </button>

            <span className="font-mono text-sm min-w-[140px] text-center">
              {MONTHS[month]} {year}
            </span>

            <button onClick={nextMonth}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <div key={day} className="text-center text-[10px] py-1">
              {day}
            </div>
          ))}

          {days.map((day, i) => {
            const dayEvents = day ? getEventsForDay(day) : [];

            return (
              <div key={i} className="aspect-square flex items-center justify-center relative">
                {day && (
                  <button
                    onClick={() => handleDayClick(day)}
                    className={`w-7 h-7 rounded-full text-xs ${
                      isToday(day)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {day}

                    {dayEvents.length > 0 && (
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((e, idx) => (
                          <span
                            key={idx}
                            className={`w-1 h-1 rounded-full ${EVENT_COLORS[e.type]}`}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Events Dialog */}
      <Dialog open={showDayEvents} onOpenChange={setShowDayEvents}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDateFormatted}</DialogTitle>
          </DialogHeader>

          {selectedDateEvents.map((event) => (
            <div key={event._id} className="flex justify-between">
              <span>{event.title}</span>

              <button onClick={() => handleDeleteEvent(event._id)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalendarWidget;