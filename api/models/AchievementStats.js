const mongoose = require("mongoose");

const AchievementStatsSchema = new mongoose.Schema({
  sessions: {
    type: Number,
    default: 0,
  },
  minutes: {
    type: Number,
    default: 0,
  },
  breaks: {
    type: Number,
    default: 0,
  },
  tasksCompleted: {
    type: Number,
    default: 0,
  },
  totalTasks: {
    type: Number,
    default: 0,
  },
  notesCount: {
    type: Number,
    default: 0,
  },
  thoughtsCount: {
    type: Number,
    default: 0,
  },
  remindersCount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("AchievementStats", AchievementStatsSchema);