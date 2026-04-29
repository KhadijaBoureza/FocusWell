const mongoose = require("mongoose");

const JournalSettingsSchema = new mongoose.Schema({
  passcodeHash: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("JournalSettings", JournalSettingsSchema);