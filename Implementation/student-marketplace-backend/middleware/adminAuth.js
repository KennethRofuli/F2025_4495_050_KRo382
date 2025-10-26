const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    if (!user.isActive || user.isSuspended) {
      return res.status(403).json({ message: "Account suspended or inactive" });
    }

    req.user = { id: user._id, role: user.role };
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = adminAuth;