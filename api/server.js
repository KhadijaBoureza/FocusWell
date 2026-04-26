require("./db");


const express = require("express");
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
const eventsRoutes = require("./routes/events");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/events", eventsRoutes);
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
// Tasks

// GET all tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ _id: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD a task
app.post("/tasks", async (req, res) => {
  try {
    const isDone = req.body.column === "done";

    const newTask = new Task({
      title: req.body.title,
      column: req.body.column || "todo",
      priority: req.body.priority || "medium",
      completed: isDone,
      createdAt: new Date().toISOString(),
      completedAt: isDone ? new Date().toISOString() : null,
    });

    await newTask.save();

    await evaluateAchievements();

    res.json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a task
app.put("/tasks/:id", async (req, res) => {
  try {
    const existingTask = await Task.findById(req.params.id);

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updates = {
      ...req.body,
    };

    if (req.body.column) {
      const movingToDone = req.body.column === "done";
      const wasAlreadyDone = existingTask.column === "done";

      updates.completed = movingToDone;

      if (movingToDone && !wasAlreadyDone) {
        const completedAt = new Date().toISOString();
        updates.completedAt = completedAt;

        await TaskCompletion.create({
          taskId: existingTask._id.toString(),
          title: existingTask.title,
          priority: existingTask.priority,
          completedAt,
        });
      }

      if (!movingToDone) {
        updates.completedAt = null;
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    await evaluateAchievements();

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get task completion
app.get("/task-completions", async (req, res) => {
  try {
    const completions = await TaskCompletion.find().sort({ completedAt: -1 });
    res.json(completions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE a task
app.delete("/tasks/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;

// Notes

// GET all notes
app.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ _id: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD note
app.post("/notes", async (req, res) => {
  try {
    const newNote = new Note({
      ...req.body,
      createdAt: new Date().toISOString().split("T")[0],
    });

    await newNote.save();
    await evaluateAchievements();

    res.json(newNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE note
app.delete("/notes/:id", async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE note
app.put("/notes/:id", async (req, res) => {
  try {
    const updated = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thoughts

// Get all thoughts
app.get("/thoughts", async (req, res) => {
  try {
    const thoughts = await Thought.find().sort({ _id: -1 });
    res.json(thoughts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post Thought
app.post("/thoughts", async (req, res) => {
  try {
    const newThought = new Thought({
      ...req.body,
      createdAt: new Date().toISOString(),
    });

    await newThought.save();

    await evaluateAchievements();

    res.json(newThought);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Thought
app.delete("/thoughts/:id", async (req, res) => {
  try {
    await Thought.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Thought
app.put("/thoughts/:id", async (req, res) => {
  try {
    const updated = await Thought.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reminders

// Get reminders
app.get("/reminders", async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ _id: -1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create reminders
app.post("/reminders", async (req, res) => {
  try {
    const newReminder = new Reminder({
      title: req.body.title,
      time: req.body.time,
      date: req.body.date,
      completed: false,
      createdAt: new Date().toISOString(),
    });

    await newReminder.save();

    await evaluateAchievements();

    res.json(newReminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update reminders
app.put("/reminders/:id", async (req, res) => {
  try {
    const updated = await Reminder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete reminders
app.delete("/reminders/:id", async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Save session
app.post("/pomodoro/session", async (req, res) => {
  try {
    const newSession = new PomodoroSession({
      mode: req.body.mode,
      duration: req.body.duration,
      completedAt: req.body.completedAt,
    });
    await newSession.save();

    await evaluateAchievements();

    res.json(newSession);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sessions
app.get("/pomodoro", async (req, res) => {
  try {
    const sessions = await PomodoroSession.find().sort({ completedAt: -1 });
    let settings = await PomodoroSettings.findOne();

    if (!settings) {
      settings = await PomodoroSettings.create({
        work: 25,
        shortBreak: 5,
        longBreak: 15,
      });
    }

    const today = new Date();
    const todayKey = today.toISOString().split("T")[0];

    const todaySessions = sessions.filter((s) => {
      const sessionDate = new Date(s.completedAt).toISOString().split("T")[0];
      return sessionDate === todayKey;
    });

    const todayWorkSessions = todaySessions.filter((s) => s.mode === "work");
    const todayBreakSessions = todaySessions.filter(
      (s) => s.mode === "shortBreak" || s.mode === "longBreak"
    );

    const todayMinutes = todayWorkSessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );

    const breaks = todayBreakSessions.length;

    const sessionLogMap = {};

    sessions.forEach((s) => {
      const date = new Date(s.completedAt).toISOString().split("T")[0];

      if (!sessionLogMap[date]) {
        sessionLogMap[date] = {
          date,
          sessions: 0,
          totalMinutes: 0,
        };
      }

      if (s.mode === "work") {
        sessionLogMap[date].sessions += 1;
        sessionLogMap[date].totalMinutes += s.duration || 0;
      }
    });

    const sessionLog = Object.values(sessionLogMap).sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    res.json({
      sessions,
      todayMinutes,
      breaks,
      sessionLog,
      durations: {
        work: settings.work,
        shortBreak: settings.shortBreak,
        longBreak: settings.longBreak,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET pomodoro settings
app.get("/pomodoro/settings", async (req, res) => {
  try {
    let settings = await PomodoroSettings.findOne();

    if (!settings) {
      settings = await PomodoroSettings.create({
        work: 25,
        shortBreak: 5,
        longBreak: 15,
      });
    }

    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE pomodoro settings
app.put("/pomodoro/settings", async (req, res) => {
  try {
    let settings = await PomodoroSettings.findOne();

    if (!settings) {
      settings = new PomodoroSettings();
    }

    settings.work = req.body.work ?? settings.work;
    settings.shortBreak = req.body.shortBreak ?? settings.shortBreak;
    settings.longBreak = req.body.longBreak ?? settings.longBreak;

    await settings.save();

    res.json(settings);
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

// ================= WELLBEING =================

// GET mood entries
app.get("/wellbeing/moods", async (req, res) => {
  try {
    const moods = await MoodEntry.find().sort({ timestamp: -1 });
    res.json(moods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE mood entry
app.post("/wellbeing/moods", async (req, res) => {
  try {
    const moodMap = {
      awful: { mood: 1, label: "Awful" },
      low: { mood: 2, label: "Low" },
      okay: { mood: 3, label: "Okay" },
      good: { mood: 4, label: "Good" },
      great: { mood: 5, label: "Great" },
    };

    const input = String(req.body.mood || "").trim().toLowerCase();
    const mapped = moodMap[input];

    if (!mapped) {
      return res.status(400).json({
        error: "Mood must be one of: awful, low, okay, good, great",
      });
    }

    const moodEntry = new MoodEntry({
      mood: mapped.mood,
      label: mapped.label,
      timestamp: req.body.timestamp || new Date().toISOString(),
    });

    await moodEntry.save();
    res.json(moodEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE mood entry
app.delete("/wellbeing/moods/:id", async (req, res) => {
  try {
    await MoodEntry.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET journal entries
app.get("/wellbeing/journal", async (req, res) => {
  try {
    const journal = await JournalEntry.find().sort({ timestamp: -1 });
    res.json(journal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE journal entry
app.post("/wellbeing/journal", async (req, res) => {
  try {
    const journalEntry = new JournalEntry({
      text: req.body.text,
      mood: req.body.mood ?? null,
      timestamp: req.body.timestamp || new Date().toISOString(),
    });

    await journalEntry.save();
    res.json(journalEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE journal entry
app.delete("/wellbeing/journal/:id", async (req, res) => {
  try {
    await JournalEntry.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Server runner
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});