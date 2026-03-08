import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function isToday(day: number) {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  }

  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Calendar</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-sm min-w-[140px] text-center">
            {MONTHS[month]} {year}
          </span>

          <button
            onClick={nextMonth}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}

        {days.map((day, index) => (
          <div key={index} className="aspect-square flex items-center justify-center">
            {day && (
              <button
                className={`w-8 h-8 rounded-full text-sm transition-colors ${
                  isToday(day)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarWidget;