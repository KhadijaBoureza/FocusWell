import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",

        month_caption: "relative flex items-center justify-center pt-1",
        caption_label: "text-sm font-mono text-foreground",

        nav: "absolute inset-x-0 top-1 flex items-center justify-between px-1 z-10",
        button_previous:
          "inline-flex h-8 w-8 items-center justify-center rounded-xl border border-primary/70 bg-background/90 text-primary shadow-sm hover:bg-primary/15 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        button_next:
          "inline-flex h-8 w-8 items-center justify-center rounded-xl border border-primary/70 bg-background/90 text-primary shadow-sm hover:bg-primary/15 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",

        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-mono font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 p-0 relative",

        day_button:
          "h-9 w-9 rounded-xl p-0 font-mono font-normal text-foreground aria-selected:opacity-100 hover:rounded-xl hover:bg-muted",

        range_end: "day-range-end",
        selected:
    "rounded-xl border border-primary/30 bg-primary/10 text-primary font-semibold hover:rounded-xl hover:bg-primary/10",
        today:
          
          "rounded-xl bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground neon-glow-violet",
        outside:
          "text-muted-foreground opacity-40 aria-selected:bg-primary/10 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-30",
        range_middle: "aria-selected:bg-primary/10 aria-selected:text-foreground",
        hidden: "invisible",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-4 w-4 text-primary", className)} />
          ) : (
            <ChevronRight className={cn("h-4 w-4 text-primary", className)} />
          ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };