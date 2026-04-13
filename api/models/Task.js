const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  column: {
    type: String,
    enum: ["todo", "inprogress", "done"],
    default: "todo",
  },
  completed: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
  completedAt: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Task", TaskSchema);