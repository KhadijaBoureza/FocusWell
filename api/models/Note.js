const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  kind: {
    type: String,
    enum: ["wish", "note"],
    default: "note",
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    enum: ["violet", "blue", "cyan"],
    default: "violet",
  },
  area: {
    type: String,
    enum: ["mind", "heart", "body", "wealth", "craft", "connection"],
    default: undefined,
  },
  horizon: {
    type: String,
    enum: ["month", "quarter", "year", "someday"],
    default: undefined,
  },
  done: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString().split("T")[0],
  },
});

module.exports = mongoose.model("Note", noteSchema);