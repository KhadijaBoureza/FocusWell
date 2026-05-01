/*
  Core data models used across the FocusHub dashboard.
  These types define the structure for tasks, notes and reminders.
*/

export type KanbanColumn = "todo" | "inprogress" | "done";

export type TaskPriority = "low" | "medium" | "high";


export interface Task {
  _id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  column: KanbanColumn;
  createdAt: string; // ISO date string
  completedAt?: string | null; // ISO date string when task is marked done
}

export type NoteColor = "violet" | "blue" | "cyan";

export type NoteKind = "wish" | "note";

export type LifeArea =
  | "mind"
  | "heart"
  | "body"
  | "wealth"
  | "craft"
  | "connection";

export type Horizon = "month" | "quarter" | "year" | "someday";

export interface Note {
  _id: string;
  kind: NoteKind;
  title: string;
  content: string;
  color: NoteColor;
  area?: LifeArea;
  horizon?: Horizon;
  done?: boolean;
  createdAt: string;
}

export interface Reminder {
  id: string;
  text: string;
  time: string; // HH:mm
  date: string; // ISO date
  completed: boolean;
}