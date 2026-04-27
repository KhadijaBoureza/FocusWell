const mongoose = require("mongoose");

const EncryptedPayloadSchema = new mongoose.Schema(
  {
    ciphertext: String,
    iv: String,
    salt: String,
  },
  { _id: false }
);

const JournalEntrySchema = new mongoose.Schema({
  text: {
    type: String,
    default: "",
    trim: true,
  },
  mood: {
    type: Number,
    enum: [1, 2, 3, 4, 5, null],
    default: null,
  },
  locked: {
    type: Boolean,
    default: false,
  },
  encrypted: {
    type: EncryptedPayloadSchema,
    default: null,
  },
  timestamp: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

module.exports = mongoose.model("JournalEntry", JournalEntrySchema);