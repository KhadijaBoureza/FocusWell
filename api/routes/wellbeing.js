const express = require("express");
const MoodEntry = require("../models/MoodEntry");
const JournalEntry = require("../models/JournalEntry");
const JournalSettings = require("../models/JournalSettings");
const {
  isValidObjectId,
  requireFields,
  isOneOf,
} = require("../utils/validators");

const router = express.Router();

const moodMap = {
  awful: { mood: 1, label: "Awful" },
  low: { mood: 2, label: "Low" },
  okay: { mood: 3, label: "Okay" },
  good: { mood: 4, label: "Good" },
  great: { mood: 5, label: "Great" },
};

router.get("/moods", async (req, res) => {
  try {
    const moods = await MoodEntry.find().sort({ timestamp: -1 });
    res.json(moods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/moods", async (req, res) => {
  try {
    const input = String(req.body.mood || "").trim().toLowerCase();

    if (!isOneOf(input, Object.keys(moodMap))) {
      return res.status(400).json({
        error: "Mood must be one of: awful, low, okay, good, great",
      });
    }

    const mapped = moodMap[input];

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

router.delete("/moods/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid mood entry id" });
    }

    const deleted = await MoodEntry.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Mood entry not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/journal", async (req, res) => {
  try {
    const journal = await JournalEntry.find().sort({ timestamp: -1 });
    res.json(journal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/journal", async (req, res) => {
  try {
    const locked = req.body.locked ?? false;

    if (typeof locked !== "boolean") {
      return res.status(400).json({
        error: "locked must be true or false",
      });
    }

    if (locked) {
      const missingEncrypted = requireFields(req.body.encrypted || {}, [
        "ciphertext",
        "iv",
        "salt",
      ]);

      if (missingEncrypted.length > 0) {
        return res.status(400).json({
          error: `Missing encrypted fields: ${missingEncrypted.join(", ")}`,
        });
      }
    } else {
      const missing = requireFields(req.body, ["text"]);

      if (missing.length > 0) {
        return res.status(400).json({
          error: "Journal text is required",
        });
      }
    }

    if (
      req.body.mood !== undefined &&
      req.body.mood !== null &&
      !isOneOf(req.body.mood, [1, 2, 3, 4, 5])
    ) {
      return res.status(400).json({
        error: "Mood must be one of: 1, 2, 3, 4, 5",
      });
    }

    const journalEntry = new JournalEntry({
      text: req.body.text ?? "",
      mood: req.body.mood ?? null,
      locked,
      encrypted: locked ? req.body.encrypted : null,
      timestamp: req.body.timestamp || new Date().toISOString(),
    });

    await journalEntry.save();
    res.json(journalEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/journal/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid journal entry id" });
    }

    const deleted = await JournalEntry.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Journal entry not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/journal/passcode", async (req, res) => {
  try {
    const settings = await JournalSettings.findOne();
    res.json({ passcodeHash: settings?.passcodeHash ?? null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/journal/passcode", async (req, res) => {
  try {
    const passcodeHash = req.body.passcodeHash ?? null;

    if (
      passcodeHash !== null &&
      (typeof passcodeHash !== "string" || passcodeHash.trim() === "")
    ) {
      return res.status(400).json({
        error: "passcodeHash must be a non-empty string or null",
      });
    }

    const settings = await JournalSettings.findOneAndUpdate(
      {},
      { passcodeHash },
      { new: true, upsert: true }
    );

    res.json({ passcodeHash: settings.passcodeHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const { getMoodInsights } = require("../services/insightsService");

router.get("/insights", async (req, res) => {
  try {
    const insights = await getMoodInsights();
    res.json(insights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;