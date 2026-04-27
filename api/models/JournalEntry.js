const mongoose = require("mongoose");

const JournalEntrySchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true,
    },
    mood: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        default: null,
    },
    timestamp: {
        type: String,
        default: () => new Date().toISOString(),
    },
    locked: {
        type: Boolean,
        default: false,
    },
    encrypted: {
        iv: String,
        salt: String,
        data: String,
    },
});

module.exports = mongoose.model("JournalEntry", JournalEntrySchema);