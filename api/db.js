require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = async (uri = process.env.MONGO_URI) => {
  try {
    await mongoose.connect(uri);
    if (process.env.NODE_ENV !== "test") {
      console.log("✅ MongoDB connected");
    }
  } catch (err) {
    console.error("❌ MongoDB error:", err);
  }
};

module.exports = connectDB;