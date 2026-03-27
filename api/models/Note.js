const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  color: String,
  createdAt: String,
});

module.exports = mongoose.model("Note", noteSchema);