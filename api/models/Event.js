const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["meeting", "interview", "schedule", "event"],
      default: "meeting",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);