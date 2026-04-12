export const api = {
  async getTimer() {
    try {
      const res = await fetch("/api/timer");
      if (!res.ok) throw new Error("Failed to fetch timer");
      return await res.json();
    } catch (err) {
      console.log("API getTimer failed, fallback to localStorage");
      throw err;
    }
  },

  async saveSession(data: any) {
    try {
      await fetch("/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch {
      console.log("API saveSession failed");
    }
  },

  async saveSettings(durations: any) {
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(durations),
      });
    } catch {
      console.log("API saveSettings failed");
    }
  },
};