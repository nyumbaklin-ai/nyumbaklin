const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { auth } = require("../middleware/auth");

// ================= ROLE CHECK =================
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied. Admins only.");
  }
  next();
};

const cleanerOnly = (req, res, next) => {
  if (req.user.role !== "cleaner") {
    return res.status(403).send("Access denied. Cleaners only.");
  }
  next();
};

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const existingUser = await pool.query(
      "SELECT * FROM customers WHERE email=$1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).send("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO customers (name, email, password, role, phone) VALUES ($1,$2,$3,'customer',$4)",
      [name, email, hashedPassword, phone || null]
    );

    res.json({
      message: "Customer registered successfully",
      role: "customer",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering customer");
  }
});

// ================= ONE-TIME ADMIN SETUP =================
router.post("/setup-admin", async (req, res) => {
  const { email, password, secret } = req.body;

  try {
    if (!email || !password || !secret) {
      return res.status(400).send("Email, password and secret are required");
    }

    if (secret !== process.env.ADMIN_SETUP_SECRET) {
      return res.status(403).send("Invalid setup secret");
    }

    const existingAdmin = await pool.query(
      "SELECT * FROM customers WHERE email=$1",
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      return res.status(400).send("Admin email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO customers (name, email, password, role) VALUES ($1,$2,$3,'admin')",
      ["Admin", email, hashedPassword]
    );

    res.json({
      message: "Admin created successfully",
      role: "admin",
      email,
    });
  } catch (error) {
    console.error("Admin setup error:", error);
    res.status(500).send("Error creating admin");
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM customers WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Login error");
  }
});

// ================= PROFILE =================
router.get("/profile", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT name, email, role, phone FROM customers WHERE email=$1",
      [req.user.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Customer not found");
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching profile");
  }
});

// ================= CREATE BOOKING =================
router.post("/book", auth, async (req, res) => {
  const { service, booking_date, booking_time, address, price } = req.body;

  if (!service || !booking_date || !booking_time || !address || !price) {
    return res.status(400).send("All booking fields are required");
  }

  try {
    await pool.query(
      `INSERT INTO bookings 
      (email, service, booking_date, booking_time, address, status, seen, price)
       VALUES ($1,$2,$3,$4,$5,'pending', false, $6)`,
      [req.user.email, service, booking_date, booking_time, address, price]
    );

    res.send("Booking created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Booking failed");
  }
});

// ================= CUSTOMER BOOKINGS (WITH PHONE LOGIC) =================
router.get("/my-bookings", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        b.id,
        b.service,
        b.booking_date,
        b.status,
        b.price,
        b.cleaner,
        c.phone AS cleaner_phone
      FROM bookings b
      LEFT JOIN customers c 
        ON b.cleaner = c.email
      WHERE b.email = $1
      ORDER BY b.id DESC
      `,
      [req.user.email]
    );

    const bookings = result.rows.map((b) => ({
      ...b,
      cleaner_phone:
        b.status === "accepted" ||
        b.status === "in progress" ||
        b.status === "completed"
          ? b.cleaner_phone
          : null,
    }));

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching bookings");
  }
});

module.exports = router;