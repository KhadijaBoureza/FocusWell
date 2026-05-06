// import { Task, Note, Reminder } from "@/types/dashboard";

// /*
//   Initial demo data
// */

// const today = new Date();
// const iso = (d: Date) => d.toISOString();
// const dateOnly = (d: Date) => d.toISOString().split("T")[0];

// const daysAgo = (n: number, hour = 9, minute = 0) => {
//   const d = new Date();
//   d.setDate(d.getDate() - n);
//   d.setHours(hour, minute, 0, 0);
//   return iso(d);
// };
// const dateNDaysAgo = (n: number) => {
//   const d = new Date();
//   d.setDate(d.getDate() - n);
//   return dateOnly(d);
// };
// const dateInDays = (n: number) => {
//   const d = new Date();
//   d.setDate(d.getDate() + n);
//   return dateOnly(d);
// };

// /* ---------------- Tasks ---------------- */
// export const mockTasks: Task[] = [
//   {
//     id: "t1",
//     title: "Plan the week's top 3 priorities",
//     completed: false,
//     priority: "high",
//     column: "todo",
//     createdAt: dateNDaysAgo(1),
//   },
//   {
//     id: "t2",
//     title: "Reply to pending personal emails",
//     completed: false,
//     priority: "medium",
//     column: "todo",
//     createdAt: dateNDaysAgo(1),
//   },
//   {
//     id: "t3",
//     title: "Book dentist appointment",
//     completed: false,
//     priority: "low",
//     column: "todo",
//     createdAt: dateNDaysAgo(2),
//   },
//   {
//     id: "t4",
//     title: "Finish online course module 3",
//     completed: false,
//     priority: "medium",
//     column: "inprogress",
//     createdAt: dateNDaysAgo(3),
//   },
//   {
//     id: "t5",
//     title: "Prepare presentation for Friday",
//     completed: false,
//     priority: "high",
//     column: "inprogress",
//     createdAt: dateNDaysAgo(2),
//   },
//   {
//     id: "t6",
//     title: "Weekly grocery shopping",
//     completed: true,
//     priority: "medium",
//     column: "done",
//     createdAt: dateNDaysAgo(5),
//     completedAt: daysAgo(1, 17, 30),
//   },
//   {
//     id: "t7",
//     title: "Call mom",
//     completed: true,
//     priority: "high",
//     column: "done",
//     createdAt: dateNDaysAgo(6),
//     completedAt: daysAgo(2, 19, 15),
//   },
//   {
//     id: "t8",
//     title: "Submit expense report",
//     completed: true,
//     priority: "medium",
//     column: "done",
//     createdAt: dateNDaysAgo(7),
//     completedAt: daysAgo(3, 14, 0),
//   },
// ];

// /* ---------------- Notes ---------------- */
// export const mockNotes: Note[] = [
//   {
//     id: "n1",
//     title: "Morning routine",
//     content:
//       "Wake at 6:30. Water before coffee. 10 minutes of stretching. Plan the day on paper before opening any screen.",
//     color: "violet",
//     createdAt: dateNDaysAgo(4),
//   },
//   {
//     id: "n2",
//     title: "Books to read",
//     content:
//       "Atomic Habits — James Clear. The Psychology of Money — Morgan Housel. Four Thousand Weeks — Oliver Burkeman.",
//     color: "blue",
//     createdAt: dateNDaysAgo(2),
//   },
//   {
//     id: "n3",
//     title: "Weekend plans",
//     content:
//       "Saturday: hike with friends, then farmers market. Sunday: slow morning, meal prep, finish the novel.",
//     color: "cyan",
//     createdAt: dateNDaysAgo(1),
//   },
// ];

// /* ---------------- Reminders ---------------- */
// export const mockReminders: Reminder[] = [
//   {
//     id: "r1",
//     text: "Morning planning + journal",
//     time: "07:30",
//     date: dateOnly(today),
//     completed: true,
//   },
//   {
//     id: "r2",
//     text: "Drink water — refill bottle",
//     time: "10:30",
//     date: dateOnly(today),
//     completed: false,
//   },
//   {
//     id: "r3",
//     text: "Lunch break — step outside",
//     time: "13:00",
//     date: dateOnly(today),
//     completed: false,
//   },
//   {
//     id: "r4",
//     text: "Evening walk",
//     time: "18:30",
//     date: dateOnly(today),
//     completed: false,
//   },
//   {
//     id: "r5",
//     text: "Read before bed",
//     time: "22:00",
//     date: dateOnly(today),
//     completed: false,
//   },
// ];

// /* ---------------- Calendar Events ---------------- */
// export interface MockCalendarEvent {
//   id: string;
//   title: string;
//   date: string;
//   time: string;
//   type: "meeting" | "interview" | "schedule" | "event";
// }

// export const mockCalendarEvents: MockCalendarEvent[] = [
//   { id: "c1", title: "Team standup", date: dateInDays(0), time: "09:30", type: "meeting" },
//   { id: "c2", title: "Yoga class", date: dateInDays(0), time: "18:00", type: "schedule" },
//   { id: "c3", title: "Coffee with Sarah", date: dateInDays(1), time: "11:00", type: "event" },
//   { id: "c4", title: "Dentist appointment", date: dateInDays(2), time: "15:30", type: "schedule" },
//   { id: "c5", title: "Job interview prep call", date: dateInDays(3), time: "10:00", type: "interview" },
//   { id: "c6", title: "Friday team review", date: dateInDays(4), time: "16:00", type: "meeting" },
//   { id: "c7", title: "Hiking trip", date: dateInDays(5), time: "08:00", type: "event" },
//   { id: "c8", title: "Family dinner", date: dateInDays(6), time: "19:00", type: "event" },
// ];

// /* ---------------- Mood Entries ---------------- */
// export interface MockMoodEntry {
//   id: string;
//   mood: 1 | 2 | 3 | 4 | 5;
//   timestamp: string;
// }

// export const mockMoodEntries: MockMoodEntry[] = [
//   { id: "m1", mood: 4, timestamp: daysAgo(0, 9, 15) },
//   { id: "m2", mood: 3, timestamp: daysAgo(1, 9, 5) },
//   { id: "m3", mood: 5, timestamp: daysAgo(2, 8, 50) },
//   { id: "m4", mood: 4, timestamp: daysAgo(3, 9, 20) },
//   { id: "m5", mood: 2, timestamp: daysAgo(4, 10, 0) },
//   { id: "m6", mood: 3, timestamp: daysAgo(5, 9, 30) },
//   { id: "m7", mood: 4, timestamp: daysAgo(6, 9, 10) },
// ];

// /* ---------------- Journal ---------------- */
// export interface MockJournalEntry {
//   id: string;
//   text: string;
//   mood?: 1 | 2 | 3 | 4 | 5;
//   timestamp: string;
//   locked?: boolean;
// }

// export const mockJournalEntries: MockJournalEntry[] = [
//   {
//     id: "j1",
//     text: "Calm morning. Made breakfast at home and read for 20 minutes before opening the laptop. Want more days that start like this.",
//     mood: 4,
//     timestamp: daysAgo(0, 19, 0),
//   },
//   {
//     id: "j2",
//     text: "Felt scattered today — too much on my plate and I said yes to one more thing I shouldn't have. Tomorrow I'll protect the morning block.",
//     mood: 2,
//     timestamp: daysAgo(2, 21, 30),
//   },
//   {
//     id: "j3",
//     text: "Long walk after work. Noticed how much lighter I feel when I move my body. Should make this a daily habit, not an occasional rescue.",
//     mood: 5,
//     timestamp: daysAgo(4, 18, 45),
//   },
//   {
//     id: "j4",
//     text: "Grateful for: a quiet weekend, the call with my brother, the smell of rain in the morning, finishing the book I'd been stuck on.",
//     mood: 4,
//     timestamp: daysAgo(6, 20, 0),
//   },
// ];

// /* ---------------- Pomodoro Stats ---------------- */
// export interface MockSessionLog {
//   date: string;
//   sessions: number;
//   totalMinutes: number;
// }

// export const mockPomodoroStats = {
//   sessions: 32,
//   breaks: 26,
//   todayMinutes: 100,
//   totalMinutes: 800,
//   sessionLog: [
//     { date: dateNDaysAgo(6), sessions: 4, totalMinutes: 100 },
//     { date: dateNDaysAgo(5), sessions: 5, totalMinutes: 125 },
//     { date: dateNDaysAgo(4), sessions: 3, totalMinutes: 75 },
//     { date: dateNDaysAgo(3), sessions: 6, totalMinutes: 150 },
//     { date: dateNDaysAgo(2), sessions: 4, totalMinutes: 100 },
//     { date: dateNDaysAgo(1), sessions: 5, totalMinutes: 125 },
//     { date: dateNDaysAgo(0), sessions: 4, totalMinutes: 100 },
//   ] as MockSessionLog[],
// };
