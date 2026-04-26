const express = require("express");
const Reminder = require("../models/Reminder");

module.exports = function createRemindersRouter({ evaluateAchievements }) {
  const router = express.Router();

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

  router.delete("/:id", async (req, res) => {
    try {
      await Reminder.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};