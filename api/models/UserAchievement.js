const mongoose = require("mongoose");

const UserAchievementSchema = new mongoose.Schema({
  badgeId: {
    type: String,
    required: true,
    unique: true,
  },
  unlocked: {
    type: Boolean,
    default: false,
  },
  unlockedAt: {
    type: Date,
    default: null,
  },
  progress: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("UserAchievement", UserAchievementSchema);