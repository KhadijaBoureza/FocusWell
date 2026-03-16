const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running ");
});

app.get("/tasks", (req, res) => {
  res.json([
    { id: 1, title: "Finish dashboard UI" },
    { id: 2, title: "Implement API connection" }
  ]);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});