require("./db");


const express = require("express");

const PORT = 5000;

const cors = require("cors");



const Note = require("./models/Note");
const Task = require("./models/Task");
const Thought = require("./models/Thought");
const Reminder = require("./models/Reminder");
const PomodoroSession = require("./models/PomodoroSession");
// const Event = require("./models/Event");
const PomodoroSettings = require("./models/PomodoroSettings");
const TaskCompletion = require("./models/TaskCompletion");
const UserAchievement = require("./models/UserAchievement");
const MoodEntry = require("./models/MoodEntry");
const JournalEntry = require("./models/JournalEntry");

const createTasksRouter = require("./routes/tasks");
const eventsRoutes = require("./routes/events");
const notesRoutes = require("./routes/notes");
const createThoughtsRouter = require("./routes/thoughts");
const createRemindersRouter = require("./routes/reminders");
const createPomodoroRouter = require("./routes/pomodoro");
const wellbeingRoutes = require("./routes/wellbeing");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/events", eventsRoutes);
app.use("/notes", notesRoutes);





// Achievements 

app.get("/achievements", async (req, res) => {
  try {
    const todayKey = new Date().toISOString().split("T")[0];

    const achievements = await UserAchievement.find({
      date: todayKey,
    }).sort({ unlockedAt: -1 });

    res.json(achievements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/achievements/unlock", async (req, res) => {
  try {
    const { badgeId, progress = 0 } = req.body;
    const todayKey = new Date().toISOString().split("T")[0];

    if (!badgeId) {
      return res.status(400).json({ error: "badgeId is required" });
    }

    let achievement = await UserAchievement.findOne({
      badgeId,
      date: todayKey,
    });

    if (!achievement) {
      achievement = new UserAchievement({
        badgeId,
        date: todayKey,
        unlocked: true,
        unlockedAt: new Date(),
        progress,
      });
    } else {
      achievement.unlocked = true;
      achievement.unlockedAt = achievement.unlockedAt || new Date();
      achievement.progress = progress;
    }

    await achievement.save();
    res.json(achievement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/achievements/:badgeId/progress", async (req, res) => {
  try {
    const { progress } = req.body;
    const todayKey = new Date().toISOString().split("T")[0];

    const achievement = await UserAchievement.findOneAndUpdate(
      {
        badgeId: req.params.badgeId,
        date: todayKey,
      },
      {
        badgeId: req.params.badgeId,
        date: todayKey,
        progress: progress ?? 0,
      },
      { new: true, upsert: true }
    );

    res.json(achievement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});






// ================= ACHIEVEMENTS =================


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

app.get("/achievements/stats", async (req, res) => {
  try {
    const stats = await getAchievementStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.use("/tasks", createTasksRouter({ evaluateAchievements }));
app.use("/thoughts", createThoughtsRouter({ evaluateAchievements }));
app.use("/reminders", createRemindersRouter({ evaluateAchievements }));
app.use("/pomodoro", createPomodoroRouter({ evaluateAchievements }));
app.use("/wellbeing", wellbeingRoutes);

// Server runner
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});