require("./db");

const express = require("express");
const cors = require("cors");

const Note = require("./models/Note");
const Task = require("./models/Task");

const app = express();

app.use(cors());
app.use(express.json());

// Temporary in-memory storage
let tasks = [
  { id: 1, title: "Finish FocusHub UI", column: "todo" },
  { id: 2, title: "Connect backend API", column: "inprogress" },
  { id: 3, title: "Deploy app", column: "done" }
];

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