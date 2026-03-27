const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://bourezakhadija_db_user:Y1B5QPOn6JosEfbv@cluster0.osqjxss.mongodb.net/notesdb?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));