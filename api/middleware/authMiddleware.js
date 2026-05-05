const Session = require("../models/Session");
const User = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = header.replace("Bearer ", "");

    const session = await Session.findOne({ token });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const user = await User.findById(session.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    req.session = session;

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { requireAuth };