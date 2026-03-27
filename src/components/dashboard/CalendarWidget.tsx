import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Clock, Tag } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
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
  id: string;
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
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>("focuswell-events", []);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDayEvents, setShowDayEvents] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", time: "09:00", type: "meeting" as EventType });

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const dateKey = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getEventsForDay = (day: number) => events.filter((e) => e.date === dateKey(day));

  const handleDayClick = (day: number) => {
    setSelectedDate(dateKey(day));
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length > 0) {
      setShowDayEvents(true);
    } else {
      setShowAddDialog(true);
    }
  };

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !selectedDate) return;
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: selectedDate,
      time: newEvent.time,
      type: newEvent.type,
    };
    setEvents([...events, event]);
    setNewEvent({ title: "", time: "08:00", type: "meeting" });
    setShowAddDialog(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const selectedDateEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : [];
  const selectedDateFormatted = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "";

  return (
    <>
      <div className="glass-card neon-border-violet p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-lg font-semibold text-foreground">Calendar</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedDate(dateKey(today.getDate()));
                setShowAddDialog(true);
              }}
              className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="Add event"
            >
              <Plus size={16} />
            </button>
            <button onClick={prevMonth} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="font-mono text-sm text-foreground min-w-[140px] text-center">
              {MONTHS[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <div key={day} className="text-center text-[10px] font-mono text-muted-foreground py-1">
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
                    className={`w-8 h-8 rounded-full text-sm font-mono transition-all relative ${
                      isToday(day)
                        ? "bg-primary text-primary-foreground neon-glow-violet"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {day}
                    {dayEvents.length > 0 && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((e, idx) => (
                          <span key={idx} className={`w-1 h-1 rounded-full ${EVENT_COLORS[e.type]}`} />
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

      {/* Add Event Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="glass-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono text-foreground flex items-center gap-2">
              <Plus size={18} className="text-primary" /> Add Event
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {selectedDateFormatted}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-mono text-muted-foreground mb-1 block">Title</label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="e.g. Team standup"
                className="bg-background/50 border-border font-mono text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-mono text-muted-foreground mb-1 block">Time</label>
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="bg-background/50 border-border font-mono text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-mono text-muted-foreground mb-1 block">Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as EventType })}
                  className="w-full h-10 rounded-md border border-border bg-background/50 px-3 text-sm font-mono text-foreground"
                >
                  {Object.entries(EVENT_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleAddEvent} className="w-full font-mono" disabled={!newEvent.title.trim()}>
              <Plus size={16} /> Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Day Events Dialog */}
      <Dialog open={showDayEvents} onOpenChange={setShowDayEvents}>
        <DialogContent className="glass-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono text-foreground flex items-center gap-2">
              <Calendar size={18} className="text-primary" /> {selectedDateFormatted}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {selectedDateEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 group">
                <span className={`w-2 h-2 rounded-full shrink-0 ${EVENT_COLORS[event.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-foreground truncate">{event.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={10} /> {event.time}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Tag size={10} /> {EVENT_LABELS[event.type]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full font-mono mt-2"
              onClick={() => {
                setShowDayEvents(false);
                setShowAddDialog(true);
              }}
            >
              <Plus size={16} /> Add Another Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalendarWidget;