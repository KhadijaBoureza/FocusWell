const express = require("express");
const PomodoroSession = require("../models/PomodoroSession");
const PomodoroSettings = require("../models/PomodoroSettings");
const { requireFields, isOneOf } = require("../utils/validators");

module.exports = function createPomodoroRouter({ evaluateAchievements }) {
  const router = express.Router();

  function isPositiveNumber(value) {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
  }

  // Save session
  router.post("/session", async (req, res) => {
    try {
      const missing = requireFields(req.body, ["mode", "duration"]);

      if (missing.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missing.join(", ")}`,
        });
      }

      if (!isOneOf(req.body.mode, ["work", "shortBreak", "longBreak"])) {
        return res.status(400).json({
          error: "Mode must be one of: work, shortBreak, longBreak",
        });
      }

      if (!isPositiveNumber(req.body.duration)) {
        return res.status(400).json({
          error: "Duration must be a positive number",
        });
      }

      const newSession = new PomodoroSession({
        mode: req.body.mode,
        duration: req.body.duration,
        completedAt: req.body.completedAt || new Date(),
      });

      await newSession.save();

      if (evaluateAchievements) {
        await evaluateAchievements();
      }

      res.json(newSession);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get sessions + summary
  router.get("/", async (req, res) => {
    try {
      const sessions = await PomodoroSession.find().sort({ completedAt: -1 });
      let settings = await PomodoroSettings.findOne();

      if (!settings) {
        settings = await PomodoroSettings.create({
          work: 25,
          shortBreak: 5,
          longBreak: 15,
        });
      }

      const today = new Date();
      const todayKey = today.toISOString().split("T")[0];

      const todaySessions = sessions.filter((s) => {
        const sessionDate = new Date(s.completedAt).toISOString().split("T")[0];
        return sessionDate === todayKey;
      });

      const todayWorkSessions = todaySessions.filter((s) => s.mode === "work");
      const todayBreakSessions = todaySessions.filter(
        (s) => s.mode === "shortBreak" || s.mode === "longBreak"
      );

      const todayMinutes = todayWorkSessions.reduce(
        (sum, s) => sum + (s.duration || 0),
        0
      );

      const breaks = todayBreakSessions.length;

      const sessionLogMap = {};

      sessions.forEach((s) => {
        const date = new Date(s.completedAt).toISOString().split("T")[0];

        if (!sessionLogMap[date]) {
          sessionLogMap[date] = {
            date,
            sessions: 0,
            totalMinutes: 0,
          };
        }

        if (s.mode === "work") {
          sessionLogMap[date].sessions += 1;
          sessionLogMap[date].totalMinutes += s.duration || 0;
        }
      });

      const sessionLog = Object.values(sessionLogMap).sort((a, b) =>
        b.date.localeCompare(a.date)
      );

      res.json({
        sessions,
        todayMinutes,
        breaks,
        sessionLog,
        durations: {
          work: settings.work,
          shortBreak: settings.shortBreak,
          longBreak: settings.longBreak,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get settings
  router.get("/settings", async (req, res) => {
    try {
      let settings = await PomodoroSettings.findOne();

      if (!settings) {
        settings = await PomodoroSettings.create({
          work: 25,
          shortBreak: 5,
          longBreak: 15,
        });
      }

      res.json(settings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update settings
  router.put("/settings", async (req, res) => {
    try {
      const fields = ["work", "shortBreak", "longBreak"];

      for (const field of fields) {
        if (
          req.body[field] !== undefined &&
          !isPositiveNumber(req.body[field])
        ) {
          return res.status(400).json({
            error: `${field} must be a positive number`,
          });
        }
      }

      let settings = await PomodoroSettings.findOne();

      if (!settings) {
        settings = new PomodoroSettings();
      }

      settings.work = req.body.work ?? settings.work;
      settings.shortBreak = req.body.shortBreak ?? settings.shortBreak;
      settings.longBreak = req.body.longBreak ?? settings.longBreak;

      await settings.save();

      res.json(settings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};