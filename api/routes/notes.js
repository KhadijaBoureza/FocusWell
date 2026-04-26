const express = require("express");
const Note = require("../models/Note");

const router = express.Router();
const { isValidObjectId, requireFields } = require("../utils/validators");

// GET all notes
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().sort({ _id: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD note
router.post("/", async (req, res) => {
  try {
    const missing = requireFields(req.body, ["title", "content"]);

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    const newNote = new Note({
      ...req.body,
      createdAt: new Date().toISOString().split("T")[0],
    });

    await newNote.save();
    res.json(newNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE note
router.put("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid note id" });
    }

    const updated = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE note
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid note id" });
    }

    const deleted = await Note.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;