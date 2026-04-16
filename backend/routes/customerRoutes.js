const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { auth, cleanerOnly } = require("../middleware/auth");
const pendingPayments = new Map();

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const normalizeText = (value) => String(value || "").trim();
const isValidId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  const name = normalizeText(req.body.name) || "Customer";
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");
  const phone = normalizeText(req.body.phone) || null;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const existingUser = await pool.query(
      "SELECT id FROM customers WHERE email=$1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO customers (name, email, password, role, phone) VALUES ($1,$2,$3,'customer',$4)",
      [name, email, hashedPassword, phone]
    );

    res.json({
      message: "Customer registered successfully",
      role: "customer",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Error registering customer" });
  }
});

// ================= ONE-TIME ADMIN SETUP =================
router.post("/setup-admin", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");
  const secret = String(req.body.secret || "");

  try {
    if (!process.env.ADMIN_SETUP_SECRET) {
      return res.status(403).json({ message: "Admin setup is disabled" });
    }

    if (!email || !password || !secret) {
      return res.status(400).json({ message: "Email, password and secret are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (secret !== process.env.ADMIN_SETUP_SECRET) {
      return res.status(403).json({ message: "Invalid setup secret" });
    }

    const existingAnyAdmin = await pool.query(
      "SELECT id FROM customers WHERE role='admin' LIMIT 1"
    );

    if (existingAnyAdmin.rows.length > 0) {
      return res.status(403).json({ message: "Admin setup already completed" });
    }

    const existingUser = await pool.query(
      "SELECT id FROM customers WHERE email=$1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Admin email already exists" });
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
    res.status(500).json({ message: "Error creating admin" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

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
    console.error("Login error:", error);
    res.status(500).json({ message: "Login error" });
  }
});

// ================= PROFILE =================
router.get("/profile", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT name, email, role, phone, location FROM customers WHERE email=$1",
      [req.user.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// ================= UPDATE PHONE =================
router.put("/update-phone", auth, async (req, res) => {
  const phone = normalizeText(req.body.phone);

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    await pool.query(
      "UPDATE customers SET phone=$1 WHERE email=$2",
      [phone, req.user.email]
    );

    res.json({ message: "Phone updated successfully" });
  } catch (error) {
    console.error("Update phone error:", error);
    res.status(500).json({ message: "Error updating phone" });
  }
});

// ================= UPDATE LOCATION =================
router.put("/update-location", auth, async (req, res) => {
  const location = normalizeText(req.body.location);

  if (!location) {
    return res.status(400).json({ message: "Location is required" });
  }

  try {
    await pool.query(
      "UPDATE customers SET location=$1 WHERE email=$2",
      [location, req.user.email]
    );

    res.json({ message: "Location updated successfully" });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({ message: "Error updating location" });
  }
});

// ================= CREATE BOOKING =================
router.post("/book", auth, async (req, res) => {
  const service = normalizeText(req.body.service);
  const booking_date = req.body.booking_date;
  const booking_time = normalizeText(req.body.booking_time);
  const address = normalizeText(req.body.address);
  const price = Number(req.body.price);
  const gps_readable_location = normalizeText(req.body.gps_readable_location) || null;

  if (!service || !booking_date || !booking_time || !address || Number.isNaN(price) || price <= 0) {
    return res.status(400).json({ message: "All booking fields are required with a valid price" });
  }

  try {
    await pool.query(
      `INSERT INTO bookings 
      (email, service, booking_date, booking_time, address, status, seen, price, gps_readable_location)
       VALUES ($1,$2,$3,$4,$5,'pending', false, $6, $7)`,
      [req.user.email, service, booking_date, booking_time, address, price, gps_readable_location]
    );

    res.json({ message: "Booking created successfully" });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Booking failed" });
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
        b.gps_readable_location,
        b.status,
        b.cleaner,
        b.price,
        b.payment_status,
        b.payment_method,
        c.phone AS cleaner_phone,
        r.rating AS submitted_rating,
        r.review AS submitted_review
      FROM bookings b
      LEFT JOIN customers c
        ON b.cleaner = c.email
      LEFT JOIN ratings r
        ON b.id = r.booking_id
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
    console.error("My bookings error:", error);
    res.status(500).json({ message: "Error fetching bookings" });
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
      new_jobs: parseInt(result.rows[0].count, 10),
    });
  } catch (error) {
    console.error("Cleaner notifications error:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// ================= VIEW AVAILABLE JOBS =================
router.get("/available-jobs", auth, cleanerOnly, async (req, res) => {
  try {
    const cleanerResult = await pool.query(
      "SELECT location FROM customers WHERE email=$1",
      [req.user.email]
    );

    const cleanerLocation = cleanerResult.rows[0]?.location || "";

    const result = await pool.query(
      `
      SELECT id, service, booking_date, booking_time, address, gps_readable_location, price
      FROM bookings
      WHERE cleaner IS NULL AND status='pending'
      ORDER BY
        CASE
          WHEN $1 <> '' AND address ILIKE $2 THEN 0
          ELSE 1
        END,
        booking_date ASC
      `,
      [cleanerLocation, `%${cleanerLocation}%`]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Available jobs error:", error);
    res.status(500).json({ message: "Error fetching available jobs" });
  }
});

// ================= ACCEPT JOB =================
router.put("/accept-job/:id", auth, cleanerOnly, async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }

  try {
    const result = await pool.query(
      `UPDATE bookings 
       SET cleaner=$1, status='accepted', seen=true 
       WHERE id=$2 AND cleaner IS NULL 
       RETURNING *`,
      [req.user.email, id]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Job already taken" });
    }

    res.json({ message: "Job accepted successfully" });
  } catch (error) {
    console.error("Accept job error:", error);
    res.status(500).json({ message: "Error accepting job" });
  }
});

// ================= CLEANER UPDATE STATUS =================
router.put("/cleaner-status/:id", auth, cleanerOnly, async (req, res) => {
  const { id } = req.params;
  const status = normalizeText(req.body.status);

  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }

  const allowedStatus = ["accepted", "in progress", "completed"];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
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
      return res.status(400).json({ message: "You cannot update this job" });
    }

    res.json({ message: "Status updated by cleaner" });
  } catch (error) {
    console.error("Cleaner status error:", error);
    res.status(500).json({ message: "Error updating status" });
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
    console.error("Cleaner earnings error:", error);
    res.status(500).json({ message: "Error calculating earnings" });
  }
});

// ================= CLEANER EARNINGS HISTORY =================
router.get("/cleaner-earnings-history", auth, cleanerOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, service, booking_date, booking_time, address, gps_readable_location, price
       FROM bookings
       WHERE cleaner=$1 AND status='completed'
       ORDER BY booking_date DESC`,
      [req.user.email]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Cleaner earnings history error:", error);
    res.status(500).json({ message: "Error fetching earnings history" });
  }
});

// ================= CLEANER MY JOBS =================
router.get("/my-cleaner-jobs", auth, cleanerOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, service, booking_date, booking_time, address, gps_readable_location, status, price
       FROM bookings 
       WHERE cleaner=$1
       ORDER BY id DESC`,
      [req.user.email]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Cleaner jobs error:", error);
    res.status(500).json({ message: "Error fetching cleaner jobs" });
  }
});

// ================= CUSTOMER BOOKING HISTORY =================
router.get("/my-bookings-simple", auth, async (req, res) => {
  try {
    const email = req.user.email;

    const result = await pool.query(
      `
      SELECT id, service, booking_date, price, status, gps_readable_location
      FROM bookings
      WHERE email = $1
      ORDER BY booking_date DESC
      `,
      [email]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("My bookings simple error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= BOOK CLEANING SERVICE =================
router.post("/book-service", auth, async (req, res) => {
  try {
    const service = normalizeText(req.body.service);
    const booking_date = req.body.booking_date;
    const price = Number(req.body.price);
    const address = normalizeText(req.body.address);
    const payment_method = normalizeText(req.body.payment_method) || "pay_after";
    const gps_readable_location = normalizeText(req.body.gps_readable_location) || null;

    const allowedPaymentMethods = ["pay_after", "momo", "cash", "mobile_money"];

    if (!service || !booking_date || !address || Number.isNaN(price) || price <= 0) {
      return res.status(400).json({ message: "All fields are required with a valid price" });
    }

    if (!allowedPaymentMethods.includes(payment_method)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const email = req.user.email;

    const result = await pool.query(
      `
      INSERT INTO bookings (
        email,
        service,
        booking_date,
        address,
        price,
        status,
        payment_method,
        gps_readable_location
      )
      VALUES ($1,$2,$3,$4,$5,'pending',$6,$7)
      RETURNING *
      `,
      [
        email,
        service,
        booking_date,
        address,
        price,
        payment_method,
        gps_readable_location,
      ]
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Book service error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= RATE COMPLETED JOB =================
router.post("/rate-job/:id", auth, async (req, res) => {
  const bookingId = req.params.id;
  const rating = Number(req.body.rating);
  const review = normalizeText(req.body.review) || null;

  if (!isValidId(bookingId)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }

  try {
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const bookingResult = await pool.query(
      "SELECT * FROM bookings WHERE id=$1 AND email=$2",
      [bookingId, req.user.email]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== "completed") {
      return res.status(400).json({ message: "You can only rate completed jobs" });
    }

    if (!booking.cleaner) {
      return res.status(400).json({ message: "No cleaner assigned" });
    }

    const existingRating = await pool.query(
      "SELECT * FROM ratings WHERE booking_id=$1",
      [bookingId]
    );

    if (existingRating.rows.length > 0) {
      return res.status(400).json({ message: "You already rated this job" });
    }

    await pool.query(
      `INSERT INTO ratings 
      (booking_id, customer_email, cleaner_email, rating, review)
      VALUES ($1,$2,$3,$4,$5)`,
      [
        bookingId,
        req.user.email,
        booking.cleaner,
        rating,
        review,
      ]
    );

    res.json({ message: "Rating submitted successfully" });
  } catch (error) {
    console.error("Rating error:", error);
    res.status(500).json({ message: "Error submitting rating" });
  }
});

// ================= PAY FOR BOOKING =================
router.post("/pay/:id", auth, async (req, res) => {
  const bookingId = req.params.id;

  if (!isValidId(bookingId)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM bookings WHERE id=$1 AND email=$2",
      [bookingId, req.user.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = result.rows[0];

    if (booking.payment_status === "paid") {
      return res.status(400).json({ message: "Booking already paid" });
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    pendingPayments.set(String(bookingId), {
      otpCode,
      email: req.user.email,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await pool.query(
      `UPDATE bookings
       SET payment_method='mobile_money'
       WHERE id=$1`,
      [bookingId]
    );

    res.json({
      message: "Payment request sent. Waiting for OTP confirmation...",
      otpCode,
    });
  } catch (error) {
    console.error("Pay error:", error);
    res.status(500).json({ message: "Payment failed" });
  }
});

// ================= CONFIRM PAYMENT OTP =================
router.post("/confirm-payment/:id", auth, async (req, res) => {
  const bookingId = req.params.id;
  const otp = normalizeText(req.body.otp);

  if (!isValidId(bookingId)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }

  try {
    const pending = pendingPayments.get(String(bookingId));

    if (!pending) {
      return res.status(400).json({ message: "No pending payment request found" });
    }

    if (pending.email !== req.user.email) {
      return res.status(403).json({ message: "You cannot confirm this payment" });
    }

    if (Date.now() > pending.expiresAt) {
      pendingPayments.delete(String(bookingId));
      return res.status(400).json({ message: "OTP expired. Please request payment again" });
    }

    if (!otp || otp !== pending.otpCode) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const result = await pool.query(
      "SELECT * FROM bookings WHERE id=$1 AND email=$2",
      [bookingId, req.user.email]
    );

    if (result.rows.length === 0) {
      pendingPayments.delete(String(bookingId));
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = result.rows[0];

    if (booking.payment_status === "paid") {
      pendingPayments.delete(String(bookingId));
      return res.status(400).json({ message: "Booking already paid" });
    }

    const commission = Math.floor(Number(booking.price) * 0.15);
    const cleanerAmount = Number(booking.price) - commission;

    await pool.query(
      `UPDATE bookings
       SET payment_status='paid',
           payment_method='mobile_money',
           commission=$1,
           cleaner_amount=$2
       WHERE id=$3`,
      [commission, cleanerAmount, bookingId]
    );

    pendingPayments.delete(String(bookingId));

    res.json({
      message: "Payment confirmed successfully",
      commission,
      cleanerAmount,
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ message: "OTP confirmation failed" });
  }
});

module.exports = router;