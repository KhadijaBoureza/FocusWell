const mongoose = require("mongoose");

const PomodoroSettingsSchema = new mongoose.Schema({
  work: {
    type: Number,
    default: 25,
  },
  shortBreak: {
    type: Number,
    default: 5,
  },
  longBreak: {
    type: Number,
    default: 15,
  },
});

module.exports = mongoose.model("PomodoroSettings", PomodoroSettingsSchema);