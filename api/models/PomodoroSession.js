const mongoose = require("mongoose");

const PomodoroSessionSchema = new mongoose.Schema({
  mode: {
    type: String,
    enum: ["work", "shortBreak", "longBreak"],
    required: true,
  },
  duration: Number, // minutes
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PomodoroSession", PomodoroSessionSchema);