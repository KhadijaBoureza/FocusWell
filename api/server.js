require("./db");

const express = require("express");
const cors = require("cors");

const Note = require("./models/Note");
const Task = require("./models/Task");
const Thought = require("./models/Thought");
const Reminder = require("./models/Reminder");

const app = express();

app.use(cors());
app.use(express.json());

// Temporary in-memory storage
let tasks = [
  { id: 1, title: "Finish FocusHub UI", column: "todo" },
  { id: 2, title: "Connect backend API", column: "inprogress" },
  { id: 3, title: "Deploy app", column: "done" }
];

//Tasks

// GET all tasks
app.get("/tasks", async (req, res) => {
  const tasks = await Task.find().sort({ _id: -1 });
  res.json(tasks);
});

// ADD a task
app.post("/tasks", async (req, res) => {
  const newTask = new Task({
    ...req.body,
    completed: req.body.column === "done",
    createdAt: new Date().toISOString().split("T")[0],
  });

  await newTask.save();

  res.json(newTask);
});

// UPDATE a task 
app.put("/tasks/:id", async (req, res) => {
  const updates = {
    ...req.body,
  };

  // Auto-handle completed if column is updated
  if (req.body.column) {
    updates.completed = req.body.column === "done";
  }

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true } // returns updated document
  );

  res.json(updatedTask);
});

// DELETE a task
app.delete("/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

const PORT = 5000;


// Notes

let notes = [
  {
    id: "1",
    title: "First note",
    content: "This is your first note",
    color: "violet",
    createdAt: new Date().toISOString().split("T")[0],
  }
];

// GET all notes
app.get("/notes", async (req, res) => {
  const notes = await Note.find().sort({ _id: -1 });
  res.json(notes);
});

// ADD note
app.post("/notes", async (req, res) => {
  const newNote = new Note({
    ...req.body,
    createdAt: new Date().toISOString().split("T")[0],
  });

  await newNote.save();

  res.json(newNote);
});

// DELETE note
app.delete("/notes/:id", async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// UPDATE not
app.put("/notes/:id", async (req, res) => {
  await Note.findByIdAndUpdate(req.params.id, req.body);
  res.json({ success: true });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//Thoughts

// Get all thoughts
app.get("/thoughts", async (req, res) => {
  const thoughts = await Thought.find().sort({ _id: -1 });
  res.json(thoughts);
});

// Post Thought
app.post("/thoughts", async (req, res) => {
  const newThought = new Thought({
    ...req.body,
    createdAt: new Date().toISOString(),
  });

  await newThought.save();
  res.json(newThought);
});

// Delete Thought
app.delete("/thoughts/:id", async (req, res) => {
  await Thought.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Update Thought
app.put("/thoughts/:id", async (req, res) => {
  const updated = await Thought.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
});

// Reminders 

//get reminders
app.get("/reminders", async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ _id: -1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create reminders 

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
// update reminders 

app.put("/reminders/:id", async (req, res) => {
  try {
    const updated = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete remeinders 
app.delete("/reminders/:id", async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


