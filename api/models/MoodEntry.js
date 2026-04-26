const mongoose = require("mongoose");

const MoodEntrySchema = new mongoose.Schema({
  mood: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    required: true,
  },
  label: {
    type: String,
    enum: ["Awful", "Low", "Okay", "Good", "Great"],
    required: true,
  },
  timestamp: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

module.exports = mongoose.model("MoodEntry", MoodEntrySchema);