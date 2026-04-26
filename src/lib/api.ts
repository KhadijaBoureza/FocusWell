const BASE = "http://localhost:5000";

export const api = {
  async getPomodoro() {
    const res = await fetch(`${BASE}/pomodoro`);
    if (!res.ok) throw new Error("Failed to fetch pomodoro");
    return await res.json();
  },

  async saveSession(data: any) {
    const res = await fetch(`${BASE}/pomodoro/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to save session");
    return await res.json();
  },

  async getTasks() {
    const res = await fetch(`${BASE}/tasks`);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return await res.json();
  },

  async saveSettings(durations: any) {
    const res = await fetch(`${BASE}/pomodoro/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(durations),
    });

    if (!res.ok) throw new Error("Failed to save settings");
    return await res.json();
  },

  async getPomodoroSettings() {
    const res = await fetch(`${BASE}/pomodoro/settings`);
    if (!res.ok) throw new Error("Failed to fetch pomodoro settings");
    return await res.json();
  },

  async getMoodEntries() {
    const res = await fetch(`${BASE}/wellbeing/moods`);
    if (!res.ok) throw new Error("Failed to fetch mood entries");
    return await res.json();
  },

  async createMoodEntry(data: { mood: string; timestamp?: string }) {
    const res = await fetch(`${BASE}/wellbeing/moods`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create mood entry");
    return await res.json();
  },

  async deleteMoodEntry(id: string) {
    const res = await fetch(`${BASE}/wellbeing/moods/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete mood entry");
    return await res.json();
  },

  async getJournalEntries() {
    const res = await fetch(`${BASE}/wellbeing/journal`);
    if (!res.ok) throw new Error("Failed to fetch journal entries");
    return await res.json();
  },

  async createJournalEntry(data: {
    text: string;
    mood?: number;
    timestamp?: string;
  }) {
    const res = await fetch(`${BASE}/wellbeing/journal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create journal entry");
    return await res.json();
  },

  async deleteJournalEntry(id: string) {
    const res = await fetch(`${BASE}/wellbeing/journal/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete journal entry");
    return await res.json();
  },

  async getTaskCompletions() {
    const res = await fetch(`${BASE}/tasks/completions`);
    if (!res.ok) throw new Error("Failed to fetch task completions");
    return await res.json();
  },
};