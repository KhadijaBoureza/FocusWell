const express = require("express");
const Task = require("../models/Task");
const TaskCompletion = require("../models/TaskCompletion");
const {
  isValidObjectId,
  requireFields,
  isOneOf,
} = require("../utils/validators");

module.exports = function createTasksRouter({ evaluateAchievements }) {
  const router = express.Router();

  // GET tasks
  router.get("/", async (req, res) => {
    try {
      const tasks = await Task.find().sort({ _id: -1 });
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // CREATE task
  router.post("/", async (req, res) => {
    try {
      const missing = requireFields(req.body, ["title"]);

      if (missing.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missing.join(", ")}`,
        });
      }

      const column = req.body.column || "todo";
      const priority = req.body.priority || "medium";

      if (!isOneOf(column, ["todo", "inprogress", "done"])) {
        return res.status(400).json({
          error: "Column must be one of: todo, inprogress, done",
        });
      }

      if (!isOneOf(priority, ["low", "medium", "high"])) {
        return res.status(400).json({
          error: "Priority must be one of: low, medium, high",
        });
      }

      const isDone = column === "done";

      const newTask = new Task({
        title: req.body.title,
        column,
        priority,
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

  // UPDATE task
  router.put("/:id", async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: "Invalid task id" });
      }

      if (
        req.body.column &&
        !isOneOf(req.body.column, ["todo", "inprogress", "done"])
      ) {
        return res.status(400).json({
          error: "Column must be one of: todo, inprogress, done",
        });
      }

      if (
        req.body.priority &&
        !isOneOf(req.body.priority, ["low", "medium", "high"])
      ) {
        return res.status(400).json({
          error: "Priority must be one of: low, medium, high",
        });
      }

      const existingTask = await Task.findById(req.params.id);

      if (!existingTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      const updates = { ...req.body };

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

      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      );

      if (evaluateAchievements) {
        await evaluateAchievements();
      }

      res.json(updatedTask);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE task
  router.delete("/:id", async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: "Invalid task id" });
      }

      const deleted = await Task.findByIdAndDelete(req.params.id);

      if (!deleted) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET completions
  router.get("/completions", async (req, res) => {
    try {
      const completions = await TaskCompletion.find().sort({ completedAt: -1 });
      res.json(completions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};