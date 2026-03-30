const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const { auth, cleanerOnly } = require("../middleware/auth");
const pool = require("../config/db");

// ================= CLEANER REGISTER =================
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).send("Email and password are required");
    }

    const existingUser = await pool.query(
      "SELECT * FROM customers WHERE email=$1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).send("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO customers (name, email, password, role) VALUES ($1,$2,$3,'cleaner')",
      ["Cleaner", email, hashedPassword]
    );

    res.json({
      message: "Cleaner registered successfully",
      role: "cleaner",
    });

  } catch (error) {
    console.error("Cleaner registration error:", error);
    res.status(500).send("Server error");
  }
});

// ================= AVAILABLE JOBS =================
router.get("/available-jobs", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, email, service, status, cleaner, price, booking_date
      FROM bookings
      WHERE cleaner IS NULL
      ORDER BY booking_date ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching available jobs:", error);
    res.status(500).send("Server error");
  }
});

// ACCEPT JOB
router.put("/accept-job/:id", async (req, res) => {
  const jobId = req.params.id;

  try {
    const result = await pool.query(
      `
      UPDATE bookings
      SET cleaner = 'cleaner@gmail.com',
          status = 'accepted'
      WHERE id = $1
      RETURNING *
      `,
      [jobId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Job not found");
    }

    res.send("Job accepted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// START JOB
router.put("/start-job/:id", async (req, res) => {
  const jobId = req.params.id;

  try {
    await pool.query(
      `UPDATE bookings SET status = 'in progress' WHERE id = $1`,
      [jobId]
    );

    res.send("Job started");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// COMPLETE JOB
router.put("/complete-job/:id", async (req, res) => {
  const jobId = req.params.id;

  try {
    await pool.query(
      `UPDATE bookings SET status = 'completed' WHERE id = $1`,
      [jobId]
    );

    res.send("Job completed");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// ================= MY CLEANER JOBS =================
router.get("/my-cleaner-jobs", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, email, service, status, price, booking_date
      FROM bookings
      WHERE cleaner = 'cleaner@gmail.com'
      ORDER BY booking_date ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching cleaner jobs:", error);
    res.status(500).send("Server error");
  }
});

// CLEANER EARNINGS
router.get("/earnings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
      COUNT(*) AS total_jobs,
      COALESCE(SUM(price),0) AS total_earnings
      FROM bookings
      WHERE cleaner = 'cleaner@gmail.com'
      AND status = 'completed'
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;