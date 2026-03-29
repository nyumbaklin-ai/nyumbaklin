const jwt = require("jsonwebtoken");

// ================= AUTH MIDDLEWARE =================
const auth = (req, res, next) => {
  try {

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).send("Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (error) {

    console.log(error);
    res.status(401).send("Invalid token");

  }
};


// ================= ADMIN ONLY =================
const adminOnly = (req, res, next) => {

  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied. Admins only.");
  }

  next();

};


// ================= CLEANER ONLY =================
const cleanerOnly = (req, res, next) => {

  if (req.user.role !== "cleaner") {
    return res.status(403).send("Access denied. Cleaners only.");
  }

  next();

};


// ================= EXPORT =================
module.exports = {
  auth,
  adminOnly,
  cleanerOnly
};