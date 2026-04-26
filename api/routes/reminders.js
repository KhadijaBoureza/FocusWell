const express = require("express");
const Reminder = require("../models/Reminder");
const {
  isValidObjectId,
  requireFields,
} = require("../utils/validators");

module.exports = function createRemindersRouter({ evaluateAchievements }) {
  const router = express.Router();

  function isPastDate(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inputDate = new Date(dateStr + "T00:00:00");
    inputDate.setHours(0, 0, 0, 0);

    return inputDate < today;
  }

  router.get("/", async (req, res) => {
    try {
      const reminders = await Reminder.find().sort({ _id: -1 });
      res.json(reminders);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const missing = requireFields(req.body, ["title", "time", "date"]);

      if (missing.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missing.join(", ")}`,
        });
      }

      if (isPastDate(req.body.date)) {
        return res.status(400).json({
          error: "Reminder date cannot be before today",
        });
      }

      const newReminder = new Reminder({
        title: req.body.title,
        time: req.body.time,
        date: req.body.date,
        completed: false,
        createdAt: new Date().toISOString(),
      });

      await newReminder.save();

      if (evaluateAchievements) {
        await evaluateAchievements();
      }

      res.json(newReminder);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: "Invalid reminder id" });
      }

      if (req.body.date && isPastDate(req.body.date)) {
        return res.status(400).json({
          error: "Reminder date cannot be before today",
        });
      }

      const updated = await Reminder.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ error: "Reminder not found" });
      }

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: "Invalid reminder id" });
      }

      const deleted = await Reminder.findByIdAndDelete(req.params.id);

      if (!deleted) {
        return res.status(404).json({ error: "Reminder not found" });
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};