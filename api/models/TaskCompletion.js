const mongoose = require("mongoose");

const TaskCompletionSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  completedAt: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("TaskCompletion", TaskCompletionSchema);