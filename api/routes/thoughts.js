const express = require("express");
const Thought = require("../models/Thought");

module.exports = function createThoughtsRouter({ evaluateAchievements }) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const thoughts = await Thought.find().sort({ _id: -1 });
      res.json(thoughts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const newThought = new Thought({
        ...req.body,
        createdAt: new Date().toISOString(),
      });

      await newThought.save();

      if (evaluateAchievements) {
        await evaluateAchievements();
      }

      res.json(newThought);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      const updated = await Thought.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      await Thought.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};