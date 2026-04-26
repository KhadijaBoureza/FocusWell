const Note = require("../models/Note");
const Task = require("../models/Task");
const Thought = require("../models/Thought");
const Reminder = require("../models/Reminder");
const PomodoroSession = require("../models/PomodoroSession");
const UserAchievement = require("../models/UserAchievement");

const getAchievementStats = async () => {
  const todayKey = new Date().toISOString().split("T")[0];

  const [sessions, tasks, notes, thoughts, reminders] = await Promise.all([
    PomodoroSession.find(),
    Task.find(),
    Note.find(),
    Thought.find(),
    Reminder.find(),
  ]);

  const todaySessions = sessions.filter((s) => {
    if (!s.completedAt) return false;
    return new Date(s.completedAt).toISOString().split("T")[0] === todayKey;
  });

  const todayTasks = tasks.filter((t) => {
    if (!t.completedAt && !t.createdAt) return false;
    const dateToCheck = t.completedAt || t.createdAt;
    return new Date(dateToCheck).toISOString().split("T")[0] === todayKey;
  });

  const todayNotes = notes.filter((n) => {
    if (!n.createdAt) return false;
    return new Date(n.createdAt).toISOString().split("T")[0] === todayKey;
  });

  const todayThoughts = thoughts.filter((t) => {
    if (!t.createdAt) return false;
    return new Date(t.createdAt).toISOString().split("T")[0] === todayKey;
  });

  const todayReminders = reminders.filter((r) => {
    if (!r.createdAt) return false;
    return new Date(r.createdAt).toISOString().split("T")[0] === todayKey;
  });

  const workSessions = todaySessions.filter((s) => s.mode === "work");
  const breakSessions = todaySessions.filter(
    (s) => s.mode === "shortBreak" || s.mode === "longBreak"
  );

  const totalMinutes = workSessions.reduce(
    (sum, s) => sum + (Number(s.duration) || 0),
    0
  );

  return {
    sessions: workSessions.length,
    minutes: totalMinutes,
    breaks: breakSessions.length,
    kanban: todayTasks,
    notes: todayNotes,
    thoughts: todayThoughts,
    reminders: todayReminders,
  };
};

async function evaluateAchievements() {
  const todayKey = new Date().toISOString().split("T")[0];
  const stats = await getAchievementStats();

  const tasksCompleted = stats.kanban.filter(
    (t) => t.column === "done" || t.completed === true
  ).length;

  const totalTasks = stats.kanban.length;

  const badgeRules = [
    { badgeId: "first-focus", value: stats.sessions, target: 1 },
    { badgeId: "five-sessions", value: stats.sessions, target: 5 },
    { badgeId: "ten-sessions", value: stats.sessions, target: 10 },
    { badgeId: "twenty-sessions", value: stats.sessions, target: 20 },
    { badgeId: "hour-focus", value: stats.minutes, target: 60 },
    { badgeId: "marathon", value: stats.minutes, target: 500 },
    { badgeId: "time-lord", value: stats.minutes, target: 1000 },
    { badgeId: "break-taker", value: stats.breaks, target: 5 },
    { badgeId: "zen-master", value: stats.breaks, target: 20 },
    { badgeId: "task-starter", value: tasksCompleted, target: 10 },
    { badgeId: "task-master", value: tasksCompleted, target: 50 },
    { badgeId: "task-creator", value: totalTasks, target: 20 },
    { badgeId: "note-keeper", value: stats.notes.length, target: 5 },
    { badgeId: "note-hoarder", value: stats.notes.length, target: 20 },
    { badgeId: "deep-thinker", value: stats.thoughts.length, target: 10 },
    { badgeId: "philosopher", value: stats.thoughts.length, target: 30 },
    { badgeId: "reminder-pro", value: stats.reminders.length, target: 10 },
  ];

  for (const badge of badgeRules) {
    const shouldUnlock = badge.value >= badge.target;

    const existing = await UserAchievement.findOne({
      badgeId: badge.badgeId,
      date: todayKey,
    });

    if (!existing) {
      await UserAchievement.create({
        badgeId: badge.badgeId,
        date: todayKey,
        unlocked: shouldUnlock,
        unlockedAt: shouldUnlock ? new Date() : null,
        progress: badge.value,
      });
    } else {
      existing.progress = badge.value;

      if (shouldUnlock && !existing.unlocked) {
        existing.unlocked = true;
        existing.unlockedAt = new Date();
      }

      await existing.save();
    }
  }

  const unlockedCount = await UserAchievement.countDocuments({
    badgeId: { $ne: "legend" },
    date: todayKey,
    unlocked: true,
  });

  if (unlockedCount >= 12) {
    await UserAchievement.findOneAndUpdate(
      { badgeId: "legend", date: todayKey },
      {
        badgeId: "legend",
        date: todayKey,
        unlocked: true,
        unlockedAt: new Date(),
        progress: unlockedCount,
      },
      { upsert: true, new: true }
    );
  }
}

module.exports = {
  getAchievementStats,
  evaluateAchievements,
};