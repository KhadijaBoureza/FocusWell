const express = require("express");
const UserAchievement = require("../models/UserAchievement");

module.exports = function createAchievementsRouter({ getAchievementStats }) {
  const router = express.Router();

  function isValidProgress(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
  }

  router.get("/", async (req, res) => {
    try {
      const todayKey = new Date().toISOString().split("T")[0];

      const achievements = await UserAchievement.find({
        date: todayKey,
      }).sort({ unlockedAt: -1 });

      res.json(achievements);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/unlock", async (req, res) => {
    try {
      const { badgeId, progress = 0 } = req.body;
      const todayKey = new Date().toISOString().split("T")[0];

      if (!badgeId || String(badgeId).trim() === "") {
        return res.status(400).json({ error: "badgeId is required" });
      }

      if (!isValidProgress(progress)) {
        return res.status(400).json({
          error: "progress must be a non-negative number",
        });
      }

      let achievement = await UserAchievement.findOne({
        badgeId,
        date: todayKey,
      });

      if (!achievement) {
        achievement = new UserAchievement({
          badgeId,
          date: todayKey,
          unlocked: true,
          unlockedAt: new Date(),
          progress,
        });
      } else {
        achievement.unlocked = true;
        achievement.unlockedAt = achievement.unlockedAt || new Date();
        achievement.progress = progress;
      }

      await achievement.save();
      res.json(achievement);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put("/:badgeId/progress", async (req, res) => {
    try {
      const { progress } = req.body;
      const todayKey = new Date().toISOString().split("T")[0];

      if (!req.params.badgeId || String(req.params.badgeId).trim() === "") {
        return res.status(400).json({ error: "badgeId is required" });
      }

      if (progress !== undefined && !isValidProgress(progress)) {
        return res.status(400).json({
          error: "progress must be a non-negative number",
        });
      }

      const achievement = await UserAchievement.findOneAndUpdate(
        {
          badgeId: req.params.badgeId,
          date: todayKey,
        },
        {
          badgeId: req.params.badgeId,
          date: todayKey,
          progress: progress ?? 0,
        },
        { new: true, upsert: true }
      );

      res.json(achievement);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/stats", async (req, res) => {
    try {
      const stats = await getAchievementStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};