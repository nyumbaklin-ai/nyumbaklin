const express = require("express");
const router = express.Router();

const { auth, adminOnly } = require("../middleware/auth");
const pool = require("../config/db");
const bcrypt = require("bcrypt");

const isValidId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;
const normalizeText = (value) => String(value || "").trim();

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

// ================= ADMIN DASHBOARD =================
router.get("/dashboard", auth, adminOnly, (req, res) => {
  res.json({
    message: "Welcome to Admin Dashboard",
    user: req.user,
  });
});

// ================= VIEW ALL USERS =================
router.get("/users", auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        email, 
        role, 
        phone,
        subscription_type,
        subscription_status,
        subscription_expiry
       FROM customers 
       ORDER BY id ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= VIEW ALL BOOKINGS =================
router.get("/bookings", auth, adminOnly, async (req, res) => {
  try {
    await ensureManualPaymentColumns();

    const result = await pool.query(`
      SELECT 
        b.id,
        b.email,
        b.service,
        b.address,
        b.gps_readable_location,
        b.status,
        b.cleaner,
        b.price,
        b.booking_date,
        b.payment_method,
        b.payment_status,
        b.commission,
        b.cleaner_amount,
        b.cleaner_payout_status,
        b.manual_payment_network,
        b.manual_payment_phone,
        b.manual_payment_reference,
        b.manual_payment_note,
        b.manual_payment_submitted_at,
        customer.phone AS customer_phone,
        cleaner_user.phone AS cleaner_phone
      FROM bookings b
      LEFT JOIN customers customer
        ON b.email = customer.email
      LEFT JOIN customers cleaner_user
        ON b.cleaner = cleaner_user.email
      ORDER BY b.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= ADMIN STATS =================
router.get("/stats", auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await pool.query("SELECT COUNT(*) FROM customers");

    const totalCustomers = await pool.query(
      "SELECT COUNT(*) FROM customers WHERE role='customer'"
    );

    const totalCleaners = await pool.query(
      "SELECT COUNT(*) FROM customers WHERE role='cleaner'"
    );

    const totalBookings = await pool.query("SELECT COUNT(*) FROM bookings");

    const completedJobs = await pool.query(
      "SELECT COUNT(*) FROM bookings WHERE status='completed'"
    );

    const totalRevenue = await pool.query(
      "SELECT COALESCE(SUM(price),0) AS revenue FROM bookings WHERE status='completed'"
    );

    res.json({
      totalUsers: totalUsers.rows[0].count,
      totalCustomers: totalCustomers.rows[0].count,
      totalCleaners: totalCleaners.rows[0].count,
      totalBookings: totalBookings.rows[0].count,
      completedJobs: completedJobs.rows[0].count,
      totalRevenue: totalRevenue.rows[0].revenue,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= DELETE USER =================
router.delete("/delete-user/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  try {
    const userResult = await pool.query(
      "SELECT id, role FROM customers WHERE id=$1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    if (user.role === "admin") {
      return res.status(403).json({ message: "You cannot delete another admin" });
    }

    await pool.query("DELETE FROM customers WHERE id=$1", [id]);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// ================= CHANGE USER ROLE =================
router.put("/change-role/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const allowedRoles = ["customer", "cleaner"];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const userResult = await pool.query(
      "SELECT role FROM customers WHERE id=$1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userResult.rows[0].role === "admin") {
      return res.status(403).json({ message: "You cannot change an admin role" });
    }

    await pool.query("UPDATE customers SET role=$1 WHERE id=$2", [role, id]);

    res.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Role update error:", error);
    res.status(500).json({ message: "Error updating role" });
  }
});

// ================= DELETE BOOKING =================
router.delete("/delete-booking/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }

  try {
    const bookingCheck = await pool.query("SELECT id FROM bookings WHERE id=$1", [
      id,
    ]);

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await pool.query("DELETE FROM bookings WHERE id=$1", [id]);

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ message: "Error deleting booking" });
  }
});

// ================= UPDATE BOOKING PRICE =================
router.put("/update-price/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }

  if (!price || isNaN(price) || Number(price) < 0) {
    return res.status(400).json({ message: "Invalid price value" });
  }

  try {
    const bookingCheck = await pool.query("SELECT id FROM bookings WHERE id=$1", [
      id,
    ]);

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await pool.query("UPDATE bookings SET price=$1 WHERE id=$2", [price, id]);

    res.json({ message: "Booking price updated successfully" });
  } catch (error) {
    console.error("Price update error:", error);
    res.status(500).json({ message: "Error updating price" });
  }
});

// ================= UPDATE PAYMENT STATUS =================
router.put("/update-payment-status/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { payment_status, payment_method } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }

  const allowedPaymentStatuses = [
    "unpaid",
    "pending_verification",
    "paid",
    "rejected",
  ];

  const allowedPaymentMethods = [
    "cash",
    "mobile_money",
    "manual_mobile_money",
  ];

  if (!allowedPaymentStatuses.includes(payment_status)) {
    return res.status(400).json({ message: "Invalid payment status" });
  }

  if (!allowedPaymentMethods.includes(payment_method)) {
    return res.status(400).json({ message: "Invalid payment method" });
  }

  try {
    const bookingCheck = await pool.query(
      "SELECT id, price FROM bookings WHERE id=$1",
      [id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingCheck.rows[0];
    const price = Number(booking.price || 0);

    let commission = null;
    let cleanerAmount = null;

    if (payment_status === "paid") {
      commission = Math.floor(price * 0.15);
      cleanerAmount = price - commission;
    }

    await pool.query(
      `UPDATE bookings
       SET payment_status=$1,
           payment_method=$2,
           commission=$3,
           cleaner_amount=$4
       WHERE id=$5`,
      [payment_status, payment_method, commission, cleanerAmount, id]
    );

    res.json({ message: "Payment status updated successfully" });
  } catch (error) {
    console.error("Payment status update error:", error);
    res.status(500).json({ message: "Error updating payment status" });
  }
});

// ================= CONFIRM MANUAL MOBILE MONEY PAYMENT =================
router.put("/confirm-manual-payment/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }

  try {
    await ensureManualPaymentColumns();

    const bookingCheck = await pool.query(
      `
      SELECT 
        id,
        price,
        payment_status,
        manual_payment_network,
        manual_payment_phone,
        manual_payment_reference
      FROM bookings
      WHERE id=$1
      `,
      [id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingCheck.rows[0];

    if (booking.payment_status === "paid") {
      return res.status(400).json({ message: "This booking is already marked as paid" });
    }

    if (!booking.manual_payment_reference) {
      return res.status(400).json({
        message: "No manual payment reference was submitted for this booking",
      });
    }

    const price = Number(booking.price || 0);
    const commission = Math.floor(price * 0.15);
    const cleanerAmount = price - commission;

    const result = await pool.query(
      `
      UPDATE bookings
      SET payment_status='paid',
          payment_method='manual_mobile_money',
          commission=$1,
          cleaner_amount=$2
      WHERE id=$3
      RETURNING 
        id,
        price,
        payment_status,
        payment_method,
        commission,
        cleaner_amount,
        manual_payment_network,
        manual_payment_phone,
        manual_payment_reference
      `,
      [commission, cleanerAmount, id]
    );

    res.json({
      message: "Manual Mobile Money payment confirmed successfully ✅",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Confirm manual payment error:", error);
    res.status(500).json({ message: "Error confirming manual payment" });
  }
});

// ================= REJECT MANUAL MOBILE MONEY PAYMENT =================
router.put("/reject-manual-payment/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const rejectionReason = normalizeText(req.body.rejection_reason);

  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }

  try {
    await ensureManualPaymentColumns();

    const bookingCheck = await pool.query(
      `
      SELECT 
        id,
        payment_status,
        manual_payment_reference
      FROM bookings
      WHERE id=$1
      `,
      [id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingCheck.rows[0];

    if (booking.payment_status === "paid") {
      return res.status(400).json({
        message: "This booking is already paid. You cannot reject it here.",
      });
    }

    if (!booking.manual_payment_reference) {
      return res.status(400).json({
        message: "No manual payment reference was submitted for this booking",
      });
    }

    const result = await pool.query(
      `
      UPDATE bookings
      SET payment_status='rejected',
          payment_method='manual_mobile_money',
          commission=NULL,
          cleaner_amount=NULL,
          manual_payment_note = CASE
            WHEN $1 = '' THEN manual_payment_note
            ELSE $1
          END
      WHERE id=$2
      RETURNING 
        id,
        payment_status,
        payment_method,
        manual_payment_network,
        manual_payment_phone,
        manual_payment_reference,
        manual_payment_note
      `,
      [rejectionReason, id]
    );

    res.json({
      message: "Manual Mobile Money payment rejected",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Reject manual payment error:", error);
    res.status(500).json({ message: "Error rejecting manual payment" });
  }
});

// ================= UPDATE CLEANER PAYOUT STATUS =================
router.put("/update-payout-status/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }

  try {
    const bookingCheck = await pool.query(
      "SELECT id, payment_status, cleaner, cleaner_payout_status FROM bookings WHERE id=$1",
      [id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingCheck.rows[0];

    if (booking.payment_status !== "paid") {
      return res.status(400).json({ message: "Customer has not paid yet" });
    }

    if (!booking.cleaner) {
      return res.status(400).json({ message: "No cleaner assigned" });
    }

    if (booking.cleaner_payout_status === "paid") {
      return res.status(400).json({ message: "Cleaner payout is already marked as paid" });
    }

    await pool.query(
      "UPDATE bookings SET cleaner_payout_status='paid' WHERE id=$1",
      [id]
    );

    res.json({ message: "Cleaner paid successfully ✅" });
  } catch (error) {
    console.error("Cleaner payout update error:", error);
    res.status(500).json({ message: "Error updating cleaner payout status" });
  }
});

// ================= ADMIN RESET USER PASSWORD =================
router.put("/reset-password/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const newPassword = String(req.body.new_password || "").trim();

  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const userResult = await pool.query(
      "SELECT id, email, role FROM customers WHERE id=$1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    if (user.role === "admin") {
      return res.status(403).json({
        message: "You cannot reset another admin password from here",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE customers SET password=$1 WHERE id=$2", [
      hashedPassword,
      id,
    ]);

    res.json({
      message: `Password reset successfully for ${user.email}`,
    });
  } catch (error) {
    console.error("Admin reset password error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
});

// ================= VIEW ALL RATINGS =================
router.get("/ratings", auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.booking_id,
        r.customer_email,
        r.cleaner_email,
        r.rating,
        r.review,
        r.created_at
      FROM ratings r
      ORDER BY r.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;