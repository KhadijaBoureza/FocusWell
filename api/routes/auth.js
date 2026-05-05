const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");
const Session = require("../models/Session");

const {
  isValidObjectId,
  requireFields,
  isValidEmail,
  isValidPassword,
} = require("../utils/validators");

const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

function safeUser(user) {
  return {
    id: user._id,
    displayName: user.displayName,
    email: user.email,
  };
}

function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

router.post("/register", async (req, res) => {
  try {
    const missing = requireFields(req.body, [
      "displayName",
      "email",
      "password",
    ]);

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    const email = req.body.email.trim().toLowerCase();
    const displayName = req.body.displayName.trim();
    const password = req.body.password;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      displayName,
      email,
      password: hashedPassword,
    });

    const token = createToken();

    await Session.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: safeUser(user),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const missing = requireFields(req.body, ["email", "password"]);

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = createToken();

    await Session.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    res.json({
      message: "Signed in successfully",
      token,
      user: safeUser(user),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({
    user: req.user,
  });
});

router.post("/logout", requireAuth, async (req, res) => {
  await Session.findByIdAndDelete(req.session._id);

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

router.get("/user/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/user/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const deleted = await User.findByIdAndDelete(req.params.id).select(
      "-password"
    );

    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }

    await Session.deleteMany({ userId: deleted._id });

    res.json({
      success: true,
      message: "User deleted successfully",
      user: deleted,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;