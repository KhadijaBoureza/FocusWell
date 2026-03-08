import { Task, Note, Reminder } from "@/types/dashboard";

/*
  Initial demo data used to populate the dashboard.
  Stored in localStorage after first interaction.
*/
export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Plan weekly focus goals",
    completed: false,
    priority: "high",
    column: "todo",
    createdAt: "2026-03-01",
  },
  {
    id: "2",
    title: "Refactor dashboard layout",
    completed: false,
    priority: "medium",
    column: "inprogress",
    createdAt: "2026-03-02",
  },
  {
    id: "3",
    title: "Implement Pomodoro timer logic",
    completed: false,
    priority: "high",
    column: "inprogress",
    createdAt: "2026-03-02",
  },
  {
    id: "4",
    title: "Add notes widget",
    completed: false,
    priority: "medium",
    column: "todo",
    createdAt: "2026-03-03",
  },
  {
    id: "5",
    title: "Improve mobile navigation",
    completed: false,
    priority: "low",
    column: "todo",
    createdAt: "2026-03-03",
  },
  {
    id: "6",
    title: "Finish dashboard UI components",
    completed: true,
    priority: "high",
    column: "done",
    createdAt: "2026-02-28",
  },
  {
    id: "7",
    title: "Setup project structure",
    completed: true,
    priority: "medium",
    column: "done",
    createdAt: "2026-02-27",
  },
];

export const mockNotes: Note[] = [
  {
    id: "1",
    title: "Focus Strategy",
    content:
      "Break large tasks into smaller steps. Use 25 minute focus sessions followed by short breaks.",
    color: "violet",
    createdAt: "2026-03-01",
  },
  {
    id: "2",
    title: "Productivity Idea",
    content:
      "Track weekly focus time to measure improvement and identify distractions.",
    color: "blue",
    createdAt: "2026-03-02",
  },
  {
    id: "3",
    title: "Quick Reminder",
    content:
      "Consistency beats intensity. Small daily improvements lead to big progress.",
    color: "cyan",
    createdAt: "2026-03-02",
  },
];

export const mockReminders: Reminder[] = [
  {
    id: "1",
    text: "Morning planning session",
    time: "08:30",
    date: "2026-03-08",
    completed: false,
  },
  {
    id: "2",
    text: "Daily focus block",
    time: "10:00",
    date: "2026-03-08",
    completed: false,
  },
  {
    id: "3",
    text: "Review completed tasks",
    time: "17:30",
    date: "2026-03-08",
    completed: false,
  },
  {
    id: "4",
    text: "Evening reflection",
    time: "21:00",
    date: "2026-03-08",
    completed: false,
  },
];