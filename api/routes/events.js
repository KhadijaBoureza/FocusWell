const express = require("express");
const Event = require("../models/Event");

const router = express.Router();
const { isValidObjectId, requireFields, isOneOf } = require("../utils/validators");

router.get("/", async (req, res) => {
    try {
        const events = await Event.find().sort({ _id: -1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/", async (req, res) => {
  try {
    const missing = requireFields(req.body, ["title", "date", "time"]);

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    const type = req.body.type || "meeting";

    if (!isOneOf(type, ["meeting", "interview", "schedule", "event"])) {
      return res.status(400).json({
        error: "Type must be one of: meeting, interview, schedule, event",
      });
    }

    const newEvent = new Event({
      title: req.body.title,
      date: req.body.date,
      time: req.body.time,
      type,
    });

    await newEvent.save();
    res.json(newEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    const deleted = await Event.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;