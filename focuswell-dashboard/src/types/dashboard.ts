/*
  Core data models used across the FocusWell dashboard.
  These types define the structure for tasks, notes and reminders.
*/

export type KanbanColumn = "todo" | "inprogress" | "done";

export type TaskPriority = "low" | "medium" | "high";

export type NoteColor = "violet" | "blue" | "cyan";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  column: KanbanColumn;
  createdAt: string; // ISO date string
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  createdAt: string; // ISO date string
}

export interface Reminder {
  id: string;
  text: string;
  time: string; // HH:mm
  date: string; // ISO date
  completed: boolean;
}