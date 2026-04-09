const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema({
  title: String,
  time: String,
  date: String,
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: String,
});

module.exports = mongoose.model("Reminder", ReminderSchema);