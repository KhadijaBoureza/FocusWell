require("./db");

const express = require("express");
const cors = require("cors");

const createTasksRouter = require("./routes/tasks");
const eventsRoutes = require("./routes/events");
const notesRoutes = require("./routes/notes");
const createThoughtsRouter = require("./routes/thoughts");
const createRemindersRouter = require("./routes/reminders");
const createPomodoroRouter = require("./routes/pomodoro");
const wellbeingRoutes = require("./routes/wellbeing");
const createAchievementsRouter = require("./routes/achievements");

const {
  getAchievementStats,
  evaluateAchievements,
} = require("./services/achievementService");

const PORT = 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/events", eventsRoutes);
app.use("/notes", notesRoutes);
app.use("/tasks", createTasksRouter({ evaluateAchievements }));
app.use("/thoughts", createThoughtsRouter({ evaluateAchievements }));
app.use("/reminders", createRemindersRouter({ evaluateAchievements }));
app.use("/pomodoro", createPomodoroRouter({ evaluateAchievements }));
app.use("/achievements", createAchievementsRouter({ getAchievementStats }));
app.use("/wellbeing", wellbeingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});