const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { auth, cleanerOnly } = require("../middleware/auth");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const normalizeText = (value) => String(value || "").trim();
const isValidId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

let manualPaymentColumnsReady = false;

const ensureManualPaymentColumns = async () => {
  if (manualPaymentColumnsReady) return;

  await pool.query(`
    ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS manual_payment_network VARCHAR(20),
    ADD COLUMN IF NOT EXISTS manual_payment_phone VARCHAR(30),
    ADD COLUMN IF NOT EXISTS manual_payment_reference VARCHAR(100),
    ADD COLUMN IF NOT EXISTS manual_payment_note TEXT,
    ADD COLUMN IF NOT EXISTS manual_payment_submitted_at TIMESTAMPTZ
  `);

  manualPaymentColumnsReady = true;
};

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

// ================= CHANGE PASSWORD =================
router.put("/change-password", auth, async (req, res) => {
  const currentPassword = String(req.body.current_password || "");
  const newPassword = String(req.body.new_password || "");
  const confirmPassword = String(req.body.confirm_password || "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      message: "Current password, new password, and confirm password are required",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "New password must be at least 6 characters",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: "New password and confirm password do not match",
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      message: "New password must be different from current password",
    });
  }

  try {
    const userResult = await pool.query(
      "SELECT id, email, password FROM customers WHERE email=$1",
      [req.user.email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    const validPassword = await bcrypt.compare(currentPassword, user.password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE customers SET password=$1 WHERE id=$2", [
      hashedPassword,
      user.id,
    ]);

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Error changing password" });
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
    await ensureManualPaymentColumns();

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
        b.manual_payment_network,
        b.manual_payment_phone,
        b.manual_payment_reference,
        b.manual_payment_note,
        b.manual_payment_submitted_at,
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
    await ensureManualPaymentColumns();

    const email = req.user.email;

    const result = await pool.query(
      `
      SELECT 
        id,
        service,
        booking_date,
        price,
        status,
        payment_status,
        payment_method,
        manual_payment_network,
        manual_payment_phone,
        manual_payment_reference,
        manual_payment_submitted_at,
        gps_readable_location
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

    const allowedPaymentMethods = [
      "pay_after",
      "momo",
      "cash",
      "mobile_money",
      "manual_mobile_money",
    ];

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

// ================= SUBMIT MANUAL MOBILE MONEY PAYMENT PROOF =================
router.post("/submit-manual-payment/:id", auth, async (req, res) => {
  const bookingId = req.params.id;
  const paymentNetwork = normalizeText(req.body.payment_network).toLowerCase();
  const paymentPhone = normalizeText(req.body.payment_phone);
  const transactionReference = normalizeText(req.body.transaction_reference).toUpperCase();
  const paymentNote = normalizeText(req.body.payment_note) || null;

  if (!isValidId(bookingId)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }

  const allowedNetworks = ["mtn", "airtel"];

  if (!allowedNetworks.includes(paymentNetwork)) {
    return res.status(400).json({ message: "Please choose MTN or Airtel" });
  }

  if (!paymentPhone) {
    return res.status(400).json({ message: "Phone number used for payment is required" });
  }

  if (paymentPhone.length < 9) {
    return res.status(400).json({ message: "Please enter a valid Mobile Money phone number" });
  }

  if (!transactionReference) {
    return res.status(400).json({ message: "Transaction reference is required" });
  }

  if (transactionReference.length < 4) {
    return res.status(400).json({ message: "Please enter a valid transaction reference" });
  }

  try {
    await ensureManualPaymentColumns();

    const bookingResult = await pool.query(
      "SELECT * FROM bookings WHERE id=$1 AND email=$2",
      [bookingId, req.user.email]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingResult.rows[0];

    if (booking.payment_status === "paid") {
      return res.status(400).json({ message: "This booking is already marked as paid" });
    }

    const duplicateReference = await pool.query(
      `
      SELECT id
      FROM bookings
      WHERE manual_payment_reference = $1
      AND id <> $2
      LIMIT 1
      `,
      [transactionReference, bookingId]
    );

    if (duplicateReference.rows.length > 0) {
      return res.status(400).json({
        message: "This transaction reference has already been submitted for another booking",
      });
    }

    const result = await pool.query(
      `
      UPDATE bookings
      SET payment_status='pending_verification',
          payment_method='manual_mobile_money',
          manual_payment_network=$1,
          manual_payment_phone=$2,
          manual_payment_reference=$3,
          manual_payment_note=$4,
          manual_payment_submitted_at=NOW()
      WHERE id=$5 AND email=$6
      RETURNING
        id,
        service,
        price,
        payment_status,
        payment_method,
        manual_payment_network,
        manual_payment_phone,
        manual_payment_reference,
        manual_payment_note,
        manual_payment_submitted_at
      `,
      [
        paymentNetwork,
        paymentPhone,
        transactionReference,
        paymentNote,
        bookingId,
        req.user.email,
      ]
    );

    res.json({
      message: "Payment proof submitted successfully. Admin will verify it soon.",
      payment: result.rows[0],
    });
  } catch (error) {
    console.error("Submit manual payment error:", error);
    res.status(500).json({ message: "Error submitting payment proof" });
  }
});

// ================= OLD DEMO OTP PAYMENT DISABLED =================
router.post("/pay/:id", auth, async (req, res) => {
  return res.status(403).json({
    message:
      "Demo OTP payment is disabled. Please use manual Mobile Money payment proof and admin verification.",
  });
});

// ================= OLD DEMO OTP CONFIRMATION DISABLED =================
router.post("/confirm-payment/:id", auth, async (req, res) => {
  return res.status(403).json({
    message:
      "Demo OTP confirmation is disabled. Payments are now verified manually by admin after checking MTN/Airtel records.",
  });
});

module.exports = router;