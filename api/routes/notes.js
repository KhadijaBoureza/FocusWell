const express = require("express");
const Note = require("../models/Note");

const router = express.Router();
const { isValidObjectId, requireFields } = require("../utils/validators");

router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().sort({ _id: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const missing = requireFields(req.body, ["title"]);

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    const newNote = new Note({
      kind: req.body.kind || "note",
      title: req.body.title,
      content: req.body.content || "",
      color: req.body.color || "violet",
      area: req.body.kind === "wish" ? req.body.area || "mind" : undefined,
      horizon: req.body.kind === "wish" ? req.body.horizon || "month" : undefined,
      done: req.body.kind === "wish" ? Boolean(req.body.done) : false,
      createdAt: new Date().toISOString().split("T")[0],
    });

    await newNote.save();
    res.json(newNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid note id" });
    }

    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        area: req.body.kind === "wish" ? req.body.area : req.body.area,
        horizon: req.body.kind === "wish" ? req.body.horizon : req.body.horizon,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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