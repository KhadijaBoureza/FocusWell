const mongoose = require("mongoose");

const JournalSettingsSchema = new mongoose.Schema({
  passcodeHash: {
    type: String,
    default: null,
    trim: true,
  },
});

// ensure only one document exists
JournalSettingsSchema.index({}, { unique: true });

module.exports = mongoose.model("JournalSettings", JournalSettingsSchema);