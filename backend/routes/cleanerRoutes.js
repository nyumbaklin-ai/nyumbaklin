const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const { auth, cleanerOnly } = require("../middleware/auth");
const pool = require("../config/db");

// ================= CLEANER REGISTER =================
router.post("/register", async (req, res) => {
  const { email, password, phone } = req.body;

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
      "INSERT INTO customers (name, email, password, role, phone) VALUES ($1,$2,$3,'cleaner',$4)",
      ["Cleaner", email, hashedPassword, phone || null]
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
router.get("/available-jobs", auth, cleanerOnly, async (req, res) => {
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

// ================= ACCEPT JOB =================
router.put("/accept-job/:id", auth, cleanerOnly, async (req, res) => {
  const jobId = req.params.id;

  try {
    const userResult = await pool.query(
      "SELECT email FROM customers WHERE id=$1",
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).send("Cleaner not found");
    }

    const cleanerEmail = userResult.rows[0].email;

    const result = await pool.query(
      `
      UPDATE bookings
      SET cleaner = $1,
          status = 'accepted'
      WHERE id = $2
      AND cleaner IS NULL
      RETURNING *
      `,
      [cleanerEmail, jobId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Job not found or already accepted");
    }

    res.send("Job accepted successfully");
  } catch (error) {
    console.error("Error accepting job:", error);
    res.status(500).send("Server error");
  }
});

// ================= START JOB =================
router.put("/start-job/:id", auth, cleanerOnly, async (req, res) => {
  const jobId = req.params.id;

  try {
    const userResult = await pool.query(
      "SELECT email FROM customers WHERE id=$1",
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).send("Cleaner not found");
    }

    const cleanerEmail = userResult.rows[0].email;

    const result = await pool.query(
      `
      UPDATE bookings
      SET status = 'in progress'
      WHERE id = $1
      AND cleaner = $2
      AND status = 'accepted'
      RETURNING *
      `,
      [jobId, cleanerEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Job not found or cannot be started");
    }

    res.send("Job started");
  } catch (error) {
    console.error("Error starting job:", error);
    res.status(500).send("Server error");
  }
});

// ================= COMPLETE JOB =================
router.put("/complete-job/:id", auth, cleanerOnly, async (req, res) => {
  const jobId = req.params.id;

  try {
    const userResult = await pool.query(
      "SELECT email FROM customers WHERE id=$1",
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).send("Cleaner not found");
    }

    const cleanerEmail = userResult.rows[0].email;

    const result = await pool.query(
      `
      UPDATE bookings
      SET status = 'completed'
      WHERE id = $1
      AND cleaner = $2
      AND status = 'in progress'
      RETURNING *
      `,
      [jobId, cleanerEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Job not found or cannot be completed");
    }

    res.send("Job completed");
  } catch (error) {
    console.error("Error completing job:", error);
    res.status(500).send("Server error");
  }
});

// ================= MY CLEANER JOBS (WITH PHONE LOGIC) =================
router.get("/my-cleaner-jobs", auth, cleanerOnly, async (req, res) => {
  try {
    const userResult = await pool.query(
      "SELECT email FROM customers WHERE id=$1",
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).send("Cleaner not found");
    }

    const cleanerEmail = userResult.rows[0].email;

    const result = await pool.query(
      `
      SELECT 
        b.id,
        b.email,
        b.service,
        b.status,
        b.price,
        b.booking_date,
        c.phone AS customer_phone
      FROM bookings b
      LEFT JOIN customers c
        ON b.email = c.email
      WHERE b.cleaner = $1
      ORDER BY b.booking_date ASC
      `,
      [cleanerEmail]
    );

    const jobs = result.rows.map((job) => ({
      ...job,
      customer_phone:
        job.status === "accepted" ||
        job.status === "in progress" ||
        job.status === "completed"
          ? job.customer_phone
          : null,
    }));

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching cleaner jobs:", error);
    res.status(500).send("Server error");
  }
});

// ================= CLEANER EARNINGS =================
router.get("/earnings", auth, cleanerOnly, async (req, res) => {
  try {
    const userResult = await pool.query(
      "SELECT email FROM customers WHERE id=$1",
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).send("Cleaner not found");
    }

    const cleanerEmail = userResult.rows[0].email;

    const result = await pool.query(
      `
      SELECT 
        COUNT(*) AS total_jobs,
        COALESCE(SUM(price), 0) AS total_value
      FROM bookings
      WHERE cleaner = $1
      AND status = 'completed'
      `,
      [cleanerEmail]
    );

    const totalJobs = Number(result.rows[0].total_jobs);
    const totalValue = Number(result.rows[0].total_value);

    const platformFee = Math.round(totalValue * 0.15);
    const cleanerEarnings = totalValue - platformFee;

    res.json({
      total_jobs: totalJobs,
      total_value: totalValue,
      platform_fee: platformFee,
      cleaner_earnings: cleanerEarnings,
    });
  } catch (error) {
    console.error("Error fetching cleaner earnings:", error);
    res.status(500).send("Server error");
  }
});

module.exports = router;