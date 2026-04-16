const jwt = require("jsonwebtoken");

// ================= AUTH MIDDLEWARE =================
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
      return res.status(401).json({ message: "Invalid authorization format." });
    }

    const token = parts[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    console.log("Auth verification failed");
    return res.status(401).json({ message: "Invalid token." });
  }
};

// ================= ADMIN ONLY =================
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  next();
};

// ================= CLEANER ONLY =================
const cleanerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "cleaner") {
    return res.status(403).json({ message: "Access denied. Cleaners only." });
  }

  next();
};

// ================= EXPORT =================
module.exports = {
  auth,
  adminOnly,
  cleanerOnly,
};