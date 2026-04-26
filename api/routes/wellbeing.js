const express = require("express");
const MoodEntry = require("../models/MoodEntry");
const JournalEntry = require("../models/JournalEntry");

const router = express.Router();

const moodMap = {
  awful: { mood: 1, label: "Awful" },
  low: { mood: 2, label: "Low" },
  okay: { mood: 3, label: "Okay" },
  good: { mood: 4, label: "Good" },
  great: { mood: 5, label: "Great" },
};

// GET mood entries
router.get("/moods", async (req, res) => {
  try {
    const moods = await MoodEntry.find().sort({ timestamp: -1 });
    res.json(moods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE mood entry
router.post("/moods", async (req, res) => {
  try {
    const input = String(req.body.mood || "").trim().toLowerCase();
    const mapped = moodMap[input];

    if (!mapped) {
      return res.status(400).json({
        error: "Mood must be one of: awful, low, okay, good, great",
      });
    }

    const moodEntry = new MoodEntry({
      mood: mapped.mood,
      label: mapped.label,
      timestamp: req.body.timestamp || new Date().toISOString(),
    });

    await moodEntry.save();
    res.json(moodEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE mood entry
router.delete("/moods/:id", async (req, res) => {
  try {
    await MoodEntry.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET journal entries
router.get("/journal", async (req, res) => {
  try {
    const journal = await JournalEntry.find().sort({ timestamp: -1 });
    res.json(journal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE journal entry
router.post("/journal", async (req, res) => {
  try {
    const journalEntry = new JournalEntry({
      text: req.body.text,
      mood: req.body.mood ?? null,
      timestamp: req.body.timestamp || new Date().toISOString(),
    });

    await journalEntry.save();
    res.json(journalEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE journal entry
router.delete("/journal/:id", async (req, res) => {
  try {
    await JournalEntry.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;