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

};