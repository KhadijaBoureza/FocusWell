require("./db");
const Note = require("./models/Note");

const express = require("express");
const cors = require("cors");

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
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// ADD a task
app.post("/tasks", (req, res) => {
  const newTask = {
    id: Date.now(),
    title: req.body.title,
    column: req.body.column || "todo"
  };

  tasks.push(newTask);

  res.json(newTask);
});

// UPDATE a task (move between columns)
app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { column } = req.body;

  tasks = tasks.map(task =>
    task.id === id ? { ...task, column } : task
  );

  res.json({ success: true });
});

// DELETE a task
app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  tasks = tasks.filter(task => task.id !== id);

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