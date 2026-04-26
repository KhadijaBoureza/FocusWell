const express = require("express");
const Task = require("../models/Task");
const TaskCompletion = require("../models/TaskCompletion");

module.exports = function createTasksRouter({ evaluateAchievements }) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const tasks = await Task.find().sort({ _id: -1 });
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/", async (req, res) => {
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

      if (evaluateAchievements) {
        await evaluateAchievements();
      }

      res.json(newTask);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put("/:id", async (req, res) => {
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

      if (evaluateAchievements) {
        await evaluateAchievements();
      }

      res.json(updatedTask);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/completions", async (req, res) => {
    try {
      const completions = await TaskCompletion.find().sort({ completedAt: -1 });
      res.json(completions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      await Task.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};