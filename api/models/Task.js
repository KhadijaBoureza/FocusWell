const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: String,
  column: String,
  completed: Boolean,
  priority: {
    type: String,
    default: "medium"
  },
  createdAt: String,
});

module.exports = mongoose.model("Task", TaskSchema);