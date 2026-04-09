const mongoose = require("mongoose");

const ThoughtSchema = new mongoose.Schema({
  content: String,
  category: {
    type: String,
    enum: ["idea", "worry", "gratitude", "reflection"],
    default: "reflection",
  },
  createdAt: String,
});

module.exports = mongoose.model("Thought", ThoughtSchema);