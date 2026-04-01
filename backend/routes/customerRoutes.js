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
      [name || "Customer", email, hashedPassword, phone || null]
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

// ================= UPDATE PHONE =================
router.put("/update-phone", auth, async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).send("Phone number is required");
  }

  try {
    await pool.query(
      "UPDATE customers SET phone=$1 WHERE email=$2",
      [phone, req.user.email]
    );

    res.send("Phone updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating phone");
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

// ================= CUSTOMER JOB TRACKING =================
router.get("/my-bookings", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        b.id,
        b.service,
        b.booking_date,
        b.booking_time,
        b.address,
        b.status,
        b.cleaner,
        b.price,
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

// ================= CLEANER NOTIFICATIONS =================
router.get("/cleaner-notifications", auth, cleanerOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) 
       FROM bookings 
       WHERE cleaner IS NULL 
       AND status='pending' 
       AND seen=false`
    );

    res.json({
      new_jobs: parseInt(result.rows[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching notifications");
  }
});

// ================= VIEW AVAILABLE JOBS =================
router.get("/available-jobs", auth, cleanerOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, service, booking_date, booking_time, address, price
       FROM bookings
       WHERE cleaner IS NULL AND status='pending'
       ORDER BY booking_date ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching available jobs");
  }
});

// ================= ACCEPT JOB =================
router.put("/accept-job/:id", auth, cleanerOnly, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE bookings 
       SET cleaner=$1, status='accepted', seen=true 
       WHERE id=$2 AND cleaner IS NULL 
       RETURNING *`,
      [req.user.email, id]
    );

    if (result.rowCount === 0) {
      return res.status(400).send("Job already taken");
    }

    res.send("Job accepted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error accepting job");
  }
});

// ================= CLEANER UPDATE STATUS =================
router.put("/cleaner-status/:id", auth, cleanerOnly, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const allowedStatus = ["accepted", "in progress", "completed"];

  if (!allowedStatus.includes(status)) {
    return res.status(400).send("Invalid status value");
  }

  try {
    const result = await pool.query(
      `UPDATE bookings 
       SET status=$1 
       WHERE id=$2 AND cleaner=$3 
       RETURNING *`,
      [status, id, req.user.email]
    );

    if (result.rowCount === 0) {
      return res.status(400).send("You cannot update this job");
    }

    res.send("Status updated by cleaner");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating status");
  }
});

// ================= CLEANER TOTAL EARNINGS =================
router.get("/cleaner-earnings", auth, cleanerOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COALESCE(SUM(price),0) AS total_earnings
       FROM bookings
       WHERE cleaner=$1 AND status='completed'`,
      [req.user.email]
    );

    res.json({
      total_earnings: Number(result.rows[0].total_earnings),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error calculating earnings");
  }
});

// ================= CLEANER EARNINGS HISTORY =================
router.get("/cleaner-earnings-history", auth, cleanerOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, service, booking_date, booking_time, address, price
       FROM bookings
       WHERE cleaner=$1 AND status='completed'
       ORDER BY booking_date DESC`,
      [req.user.email]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching earnings history");
  }
});

// ================= CLEANER MY JOBS =================
router.get("/my-cleaner-jobs", auth, cleanerOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, service, booking_date, booking_time, address, status, price
       FROM bookings 
       WHERE cleaner=$1
       ORDER BY id DESC`,
      [req.user.email]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching cleaner jobs");
  }
});

// ================= CUSTOMER BOOKING HISTORY =================
router.get("/my-bookings-simple", auth, async (req, res) => {
  try {
    const email = req.user.email;

    const result = await pool.query(
      `
      SELECT id, service, booking_date, price, status
      FROM bookings
      WHERE email = $1
      ORDER BY booking_date DESC
      `,
      [email]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// ================= BOOK CLEANING SERVICE =================
router.post("/book-service", auth, async (req, res) => {
  try {
    const { service, booking_date, price } = req.body;
    const email = req.user.email;

    if (!service || !booking_date || !price) {
      return res.status(400).send("All fields are required");
    }

    const result = await pool.query(
      `
      INSERT INTO bookings (email, service, booking_date, price, status)
      VALUES ($1,$2,$3,$4,'pending')
      RETURNING *
      `,
      [email, service, booking_date, price]
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;