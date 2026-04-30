const MoodEntry = require("../models/MoodEntry");
const Task = require("../models/Task");

async function getMoodInsights() {
  const moods = await MoodEntry.find();
  const tasks = await Task.find();

  if (moods.length === 0) {
    return {
      averageMood: null,
      insight: "Not enough data yet",
    };
  }

  // group by date
  const moodByDate = {};
  moods.forEach((m) => {
    const date = m.timestamp.split("T")[0];
    if (!moodByDate[date]) moodByDate[date] = [];
    moodByDate[date].push(m.mood);
  });

  const taskByDate = {};
  tasks.forEach((t) => {
    const date = (t.completedAt || t.createdAt || "").split("T")[0];
    if (!date) return;
    if (!taskByDate[date]) taskByDate[date] = 0;
    if (t.completed) taskByDate[date] += 1;
  });

  let productiveMood = [];
  let nonProductiveMood = [];

  Object.keys(moodByDate).forEach((date) => {
    const avgMood =
      moodByDate[date].reduce((a, b) => a + b, 0) /
      moodByDate[date].length;

    if ((taskByDate[date] || 0) > 0) {
      productiveMood.push(avgMood);
    } else {
      nonProductiveMood.push(avgMood);
    }
  });

  const avgProductive =
    productiveMood.reduce((a, b) => a + b, 0) /
      (productiveMood.length || 1);

  const avgNonProductive =
    nonProductiveMood.reduce((a, b) => a + b, 0) /
      (nonProductiveMood.length || 1);

  let insight = "No clear pattern yet";

  if (avgProductive > avgNonProductive) {
    insight = "You tend to feel better on productive days";
  } else if (avgProductive < avgNonProductive) {
    insight = "You feel better on more relaxed days";
  }

  return {
    averageMood:
      moods.reduce((a, b) => a + b.mood, 0) / moods.length,
    productiveDays: productiveMood.length,
    nonProductiveDays: nonProductiveMood.length,
    insight,
  };
}

module.exports = { getMoodInsights };