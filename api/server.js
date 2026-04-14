require("./db");

const express = require("express");
const cors = require("cors");

const Note = require("./models/Note");
const Task = require("./models/Task");
const Thought = require("./models/Thought");
const Reminder = require("./models/Reminder");
const PomodoroSession = require("./models/PomodoroSession");

const app = express();

app.use(cors());
app.use(express.json());

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
        updates.completedAt = new Date().toISOString();
      }

      if (!movingToDone) {
        updates.completedAt = null;
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    res.json(updatedTask);
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

    res.json(newSession);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sessions
app.get("/pomodoro", async (req, res) => {
  try {
    const sessions = await PomodoroSession.find().sort({ completedAt: -1 });

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todaySessions = sessions.filter((s) => {
      const completed = new Date(s.completedAt);
      return completed >= startOfToday && completed < startOfTomorrow;
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
      durations: { work: 25, shortBreak: 5, longBreak: 15 },
      todayMinutes,
      breaks,
      sessionLog,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Server runner
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});