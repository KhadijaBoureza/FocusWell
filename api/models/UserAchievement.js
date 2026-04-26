const mongoose = require("mongoose");

const UserAchievementSchema = new mongoose.Schema({
  badgeId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
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

UserAchievementSchema.index({ badgeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("UserAchievement", UserAchievementSchema);