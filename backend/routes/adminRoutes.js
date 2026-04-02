const express = require("express");
const router = express.Router();

const { auth, adminOnly } = require("../middleware/auth");
const pool = require("../config/db");

// ================= ADMIN DASHBOARD =================
router.get("/dashboard", auth, adminOnly, (req, res) => {
  res.json({
    message: "Welcome to Admin Dashboard",
    user: req.user
  });
});

// ================= VIEW ALL USERS =================
router.get("/users", auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, role, phone FROM customers ORDER BY id ASC"
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
    const result = await pool.query(`
      SELECT 
        b.id,
        b.email,
        b.service,
        b.address,
        b.status,
        b.cleaner,
        b.price,
        b.booking_date,
        b.payment_method,
        b.payment_status,
        b.commission,
        b.cleaner_amount,
        b.cleaner_payout_status,
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
    const totalUsers = await pool.query(
      "SELECT COUNT(*) FROM customers"
    );

    const totalCustomers = await pool.query(
      "SELECT COUNT(*) FROM customers WHERE role='customer'"
    );

    const totalCleaners = await pool.query(
      "SELECT COUNT(*) FROM customers WHERE role='cleaner'"
    );

    const totalBookings = await pool.query(
      "SELECT COUNT(*) FROM bookings"
    );

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
      totalRevenue: totalRevenue.rows[0].revenue
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= DELETE USER =================
router.delete("/delete-user/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;

  try {
    const userResult = await pool.query(
      "SELECT id, role FROM customers WHERE id=$1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const user = userResult.rows[0];

    if (user.role === "admin") {
      return res.status(403).send("You cannot delete another admin");
    }

    await pool.query(
      "DELETE FROM customers WHERE id=$1",
      [id]
    );

    res.send("User deleted successfully");
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).send("Error deleting user");
  }
});

// ================= CHANGE USER ROLE =================
router.put("/change-role/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const allowedRoles = ["customer", "cleaner"];

  if (!allowedRoles.includes(role)) {
    return res.status(400).send("Invalid role");
  }

  try {
    const userResult = await pool.query(
      "SELECT role FROM customers WHERE id=$1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    if (userResult.rows[0].role === "admin") {
      return res.status(403).send("You cannot change an admin role");
    }

    await pool.query(
      "UPDATE customers SET role=$1 WHERE id=$2",
      [role, id]
    );

    res.send("User role updated successfully");
  } catch (error) {
    console.error("Role update error:", error);
    res.status(500).send("Error updating role");
  }
});

// ================= DELETE BOOKING =================
router.delete("/delete-booking/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;

  try {
    const bookingCheck = await pool.query(
      "SELECT id FROM bookings WHERE id=$1",
      [id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).send("Booking not found");
    }

    await pool.query(
      "DELETE FROM bookings WHERE id=$1",
      [id]
    );

    res.send("Booking deleted successfully");
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).send("Error deleting booking");
  }
});

// ================= UPDATE BOOKING PRICE =================
router.put("/update-price/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  if (!price || isNaN(price) || Number(price) < 0) {
    return res.status(400).send("Invalid price value");
  }

  try {
    const bookingCheck = await pool.query(
      "SELECT id FROM bookings WHERE id=$1",
      [id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).send("Booking not found");
    }

    await pool.query(
      "UPDATE bookings SET price=$1 WHERE id=$2",
      [price, id]
    );

    res.send("Booking price updated successfully");
  } catch (error) {
    console.error("Price update error:", error);
    res.status(500).send("Error updating price");
  }
});

// ================= UPDATE PAYMENT STATUS =================
router.put("/update-payment-status/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { payment_status, payment_method } = req.body;

  const allowedPaymentStatuses = ["unpaid", "paid"];
  const allowedPaymentMethods = ["cash", "mobile_money"];

  if (!allowedPaymentStatuses.includes(payment_status)) {
    return res.status(400).send("Invalid payment status");
  }

  if (!allowedPaymentMethods.includes(payment_method)) {
    return res.status(400).send("Invalid payment method");
  }

  try {
    const bookingCheck = await pool.query(
      "SELECT id, price FROM bookings WHERE id=$1",
      [id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).send("Booking not found");
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

    res.send("Payment status updated successfully");
  } catch (error) {
    console.error("Payment status update error:", error);
    res.status(500).send("Error updating payment status");
  }
});

// ================= UPDATE CLEANER PAYOUT STATUS =================
router.put("/update-payout-status/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { cleaner_payout_status } = req.body;

  const allowedStatuses = ["unpaid", "paid"];

  if (!allowedStatuses.includes(cleaner_payout_status)) {
    return res.status(400).send("Invalid payout status");
  }

  try {
    const bookingCheck = await pool.query(
      "SELECT id FROM bookings WHERE id=$1",
      [id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).send("Booking not found");
    }

    await pool.query(
      "UPDATE bookings SET cleaner_payout_status=$1 WHERE id=$2",
      [cleaner_payout_status, id]
    );

    res.send("Cleaner payout status updated successfully");
  } catch (error) {
    console.error("Cleaner payout update error:", error);
    res.status(500).send("Error updating cleaner payout status");
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