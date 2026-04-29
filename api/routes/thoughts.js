const express = require("express");
const Thought = require("../models/Thought");
const {
  isValidObjectId,
  requireFields,
  isOneOf,
} = require("../utils/validators");

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
      const missing = requireFields(req.body, ["content"]);

      if (missing.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missing.join(", ")}`,
        });
      }

      const category = req.body.category || "reflection";

      if (!isOneOf(category, ["idea", "worry", "gratitude", "reflection"])) {
        return res.status(400).json({
          error: "Category must be one of: idea, worry, gratitude, reflection",
        });
      }

      const newThought = new Thought({
        content: req.body.content,
        category,
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
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: "Invalid thought id" });
      }

      if (
        req.body.category &&
        !isOneOf(req.body.category, [
          "idea",
          "worry",
          "gratitude",
          "reflection",
        ])
      ) {
        return res.status(400).json({
          error: "Category must be one of: idea, worry, gratitude, reflection",
        });
      }

      const updated = await Thought.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      if (!updated) {
        return res.status(404).json({ error: "Thought not found" });
      }

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: "Invalid thought id" });
      }

      const deleted = await Thought.findByIdAndDelete(req.params.id);

      if (!deleted) {
        return res.status(404).json({ error: "Thought not found" });
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};