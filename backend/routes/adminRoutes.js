const express = require("express");
const router = express.Router();

const { auth, adminOnly } = require("../middleware/auth");
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const isValidId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;
const normalizeText = (value) => String(value || "").trim();

const cleanerPhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG, PNG, or WEBP image files are allowed")
      );
    }

    cb(null, true);
  },
});

let cleanerPhotoColumnReady = false;

const ensureCleanerPhotoColumn = async () => {
  if (cleanerPhotoColumnReady) return;

  await pool.query(`
    ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS profile_photo_url TEXT
  `);

  cleanerPhotoColumnReady = true;
};

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

let bookingAddonsColumnsReady = false;

const ensureBookingAddonsColumns = async () => {
  if (bookingAddonsColumnsReady) return;

  await pool.query(`
    ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS addons JSONB NOT NULL DEFAULT '[]'::jsonb
  `);

  await pool.query(`
    ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS addon_total INTEGER NOT NULL DEFAULT 0
  `);

  await pool.query(`
    ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS addon_assessment_required BOOLEAN NOT NULL DEFAULT false
  `);

  await pool.query(`
    ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS addon_assessment_confirmed BOOLEAN NOT NULL DEFAULT false
  `);

  await pool.query(`
    ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS addon_assessment_confirmed_at TIMESTAMPTZ
  `);

  bookingAddonsColumnsReady = true;
};
let servicePricesReady = false;

const ensureServicePricesTable = async () => {
  if (servicePricesReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS service_prices (
      id SERIAL PRIMARY KEY,
      service_name VARCHAR(100) NOT NULL,
      option_label VARCHAR(120) NOT NULL,
      booking_service VARCHAR(220) NOT NULL UNIQUE,
      price INTEGER NOT NULL CHECK (price > 0),
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    INSERT INTO service_prices
      (service_name, option_label, booking_service, price, sort_order)
    VALUES
      ('House Cleaning', '1-2 Rooms', 'House Cleaning (1-2 rooms)', 33000, 10),
      ('House Cleaning', '3-4 Rooms', 'House Cleaning (3-4 rooms)', 48000, 20),
      ('House Cleaning', '5-6 Rooms', 'House Cleaning (5-6 rooms)', 65000, 30),

      ('Deep Cleaning', '1-2 Rooms', 'Deep Cleaning (1-2 rooms)', 75000, 40),
      ('Deep Cleaning', '3-4 Rooms', 'Deep Cleaning (3-4 rooms)', 105000, 50),
      ('Deep Cleaning', '5-6 Rooms', 'Deep Cleaning (5-6 rooms)', 135000, 60),

      ('Office Cleaning', '1-2 Rooms', 'Office Cleaning (1-2 rooms)', 65000, 70),
      ('Office Cleaning', '3-4 Rooms', 'Office Cleaning (3-4 rooms)', 95000, 80),
      ('Office Cleaning', '5-6 Rooms', 'Office Cleaning (5-6 rooms)', 125000, 90),

      ('Sofa Set Cleaning', '3-Seater', 'Sofa Set Cleaning (3-seater)', 60000, 100),
      ('Sofa Set Cleaning', '4-Seater', 'Sofa Set Cleaning (4-seater)', 80000, 110),
      ('Sofa Set Cleaning', '5-Seater', 'Sofa Set Cleaning (5-seater)', 100000, 120),
      ('Sofa Set Cleaning', '6-Seater', 'Sofa Set Cleaning (6-seater)', 120000, 130),
      ('Sofa Set Cleaning', '7-Seater', 'Sofa Set Cleaning (7-seater)', 140000, 140),
      ('Sofa Set Cleaning', 'L-Shaped', 'Sofa Set Cleaning (L-shaped)', 100000, 150),

      ('Carpet Cleaning', 'Small - Standard', 'Carpet Cleaning (Small, Standard)', 30000, 160),
      ('Carpet Cleaning', 'Small - Shaggy / High-Pile', 'Carpet Cleaning (Small, Shaggy / High-Pile)', 50000, 170),
      ('Carpet Cleaning', 'Medium - Standard', 'Carpet Cleaning (Medium, Standard)', 50000, 180),
      ('Carpet Cleaning', 'Medium - Shaggy / High-Pile', 'Carpet Cleaning (Medium, Shaggy / High-Pile)', 70000, 190),
      ('Carpet Cleaning', 'Large - Standard', 'Carpet Cleaning (Large, Standard)', 80000, 200),
      ('Carpet Cleaning', 'Large - Shaggy / High-Pile', 'Carpet Cleaning (Large, Shaggy / High-Pile)', 100000, 210),

      ('Mobile Car Washing', 'Small/Medium Car', 'Mobile Car Washing (Small/Medium Car)', 35000, 220),
      ('Mobile Car Washing', 'SUV/Pickup', 'Mobile Car Washing (SUV/Pickup)', 45000, 230),
      ('Mobile Car Washing', 'Large SUV/Van', 'Mobile Car Washing (Large SUV/Van)', 55000, 240)
    ON CONFLICT (booking_service) DO NOTHING
  `);

  servicePricesReady = true;
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
      await ensureCleanerPhotoColumn()
    const result = await pool.query(
      `SELECT 
        id,
        name,
        email, 
        role, 
        phone,
        deletion_requested,
        deletion_requested_at,
        subscription_type,
        subscription_status,
        subscription_expiry,
        profile_photo_url
       FROM customers 
       ORDER BY id ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= ADMIN UPLOAD CLEANER PHOTO =================
router.put("/cleaner-photo/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({
      message: "Invalid cleaner id",
    });
  }

  try {
    await ensureCleanerPhotoColumn();

    const cleanerCheck = await pool.query(
      `
      SELECT id, email, role
      FROM customers
      WHERE id = $1
      `,
      [id]
    );

    if (cleanerCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Cleaner not found",
      });
    }

    if (cleanerCheck.rows[0].role !== "cleaner") {
      return res.status(400).json({
        message: "Photo can only be uploaded for cleaner accounts",
      });
    }

    cleanerPhotoUpload.single("photo")(req, res, async (uploadError) => {
      if (uploadError) {
        return res.status(400).json({
          message: uploadError.message || "Invalid photo upload",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Please select a cleaner photo",
        });
      }

      try {
        const cloudinaryResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "nyumbaklin/cleaners",
              public_id: `cleaner_${id}`,
              overwrite: true,
              invalidate: true,
              resource_type: "image",
              transformation: [
                {
                  width: 500,
                  height: 500,
                  crop: "fill",
                  gravity: "face",
                },
              ],
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          uploadStream.end(req.file.buffer);
        });

        const result = await pool.query(
          `
          UPDATE customers
          SET profile_photo_url = $1
          WHERE id = $2
          AND role = 'cleaner'
          RETURNING
            id,
            email,
            role,
            profile_photo_url
          `,
          [cloudinaryResult.secure_url, id]
        );

        res.json({
          message: "Cleaner photo uploaded successfully",
          cleaner: result.rows[0],
        });
      } catch (error) {
        console.error("Cleaner photo upload error:", error);

        res.status(500).json({
          message: "Error uploading cleaner photo",
        });
      }
    });
  } catch (error) {
    console.error("Cleaner photo preparation error:", error);

    res.status(500).json({
      message: "Error preparing cleaner photo upload",
    });
  }
});

// ================= ADMIN ACTIVATE CLEANER PREMIUM =================
router.put("/activate-cleaner-premium/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const plan = normalizeText(req.body.plan).toLowerCase();

  if (!isValidId(id)) {
    return res.status(400).json({
      message: "Invalid cleaner id",
    });
  }

  if (plan !== "weekly" && plan !== "monthly") {
    return res.status(400).json({
      message: "Plan must be weekly or monthly",
    });
  }

  try {
    const userResult = await pool.query(
      `
      SELECT
        id,
        email,
        role,
        subscription_type,
        subscription_status,
        subscription_expiry
      FROM customers
      WHERE id = $1
      `,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "Cleaner not found",
      });
    }

    const cleaner = userResult.rows[0];

    if (cleaner.role !== "cleaner") {
      return res.status(400).json({
        message: "Premium can only be activated for cleaner accounts",
      });
    }

    const now = new Date();
    let baseDate = now;

    if (
      cleaner.subscription_type === "premium" &&
      cleaner.subscription_status === "active" &&
      cleaner.subscription_expiry &&
      new Date(cleaner.subscription_expiry) > now
    ) {
      baseDate = new Date(cleaner.subscription_expiry);
    }

    const newExpiry = new Date(baseDate);

    if (plan === "weekly") {
      newExpiry.setDate(newExpiry.getDate() + 7);
    } else {
      newExpiry.setMonth(newExpiry.getMonth() + 1);
    }

    const updateResult = await pool.query(
      `
      UPDATE customers
      SET subscription_type = 'premium',
          subscription_status = 'active',
          subscription_expiry = $1
      WHERE id = $2
      RETURNING
        id,
        email,
        role,
        subscription_type,
        subscription_status,
        subscription_expiry
      `,
      [newExpiry, id]
    );

    res.json({
      message: `Premium ${plan} plan activated successfully for ${cleaner.email}`,
      cleaner: updateResult.rows[0],
    });
  } catch (error) {
    console.error("Admin premium activation error:", error);
    res.status(500).json({
      message: "Error activating cleaner premium",
    });
  }
});

// ================= VIEW ALL BOOKINGS =================
router.get("/bookings", auth, adminOnly, async (req, res) => {
  try {
    await ensureManualPaymentColumns();
    await ensureBookingAddonsColumns();

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
        b.addons,
        b.addon_total,
        b.addon_assessment_required,
        b.addon_assessment_confirmed,
        b.addon_assessment_confirmed_at,
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

// ================= SERVICE PRICES =================
router.get("/service-prices", auth, adminOnly, async (req, res) => {
  try {
    await ensureServicePricesTable();

    const result = await pool.query(`
      SELECT id, service_name, option_label, booking_service, price, sort_order, updated_at
      FROM service_prices
      ORDER BY sort_order ASC, id ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch service prices error:", error);
    res.status(500).json({ message: "Error fetching service prices" });
  }
});

router.put("/service-prices/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const price = Number(req.body.price);

  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid service price id" });
  }

  if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(price)) {
    return res.status(400).json({
      message: "Please enter a valid whole-number price above zero",
    });
  }

  try {
    await ensureServicePricesTable();

    const result = await pool.query(
      `
      UPDATE service_prices
      SET price=$1,
          updated_at=NOW()
      WHERE id=$2
      RETURNING id, service_name, option_label, booking_service, price, sort_order, updated_at
      `,
      [price, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Service price not found" });
    }

    res.json({
      message: "Service price updated successfully",
      service_price: result.rows[0],
    });
  } catch (error) {
    console.error("Update service price error:", error);
    res.status(500).json({ message: "Error updating service price" });
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

// ================= UPDATE CLEANER NAME =================
router.put("/update-cleaner-name/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const name = normalizeText(req.body.name);

  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid cleaner id" });
  }

  if (!name) {
    return res.status(400).json({ message: "Cleaner name is required" });
  }

  try {
    const cleanerCheck = await pool.query(
      `
      SELECT id, role
      FROM customers
      WHERE id=$1
      `,
      [id]
    );

    if (cleanerCheck.rows.length === 0) {
      return res.status(404).json({ message: "Cleaner not found" });
    }

    if (cleanerCheck.rows[0].role !== "cleaner") {
      return res.status(400).json({
        message: "Name can only be updated here for cleaner accounts",
      });
    }

    const result = await pool.query(
      `
      UPDATE customers
      SET name=$1
      WHERE id=$2
      RETURNING id, name, email, role
      `,
      [name, id]
    );

    res.json({
      message: "Cleaner name updated successfully",
      cleaner: result.rows[0],
    });
  } catch (error) {
    console.error("Cleaner name update error:", error);
    res.status(500).json({ message: "Error updating cleaner name" });
  }
});

// ================= CREATE CLEANER ACCOUNT =================
router.post("/create-cleaner", auth, adminOnly, async (req, res) => {
  const name = normalizeText(req.body.name);
  const email = normalizeText(req.body.email).toLowerCase();
  const phone = normalizeText(req.body.phone);
  const password = String(req.body.password || "");

  if (!name || !email || !phone || !password) {
    return res.status(400).json({
      message: "Name, email, phone number, and password are required",
    });
  }

  if (!email.includes("@")) {
    return res.status(400).json({
      message: "Please enter a valid email address",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Temporary password must be at least 6 characters",
    });
  }

  try {
    const existingUser = await pool.query(
      `
      SELECT id
      FROM customers
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO customers
        (name, email, password, role, phone)
      VALUES
        ($1, $2, $3, 'cleaner', $4)
      RETURNING
        id,
        name,
        email,
        role,
        phone
      `,
      [name, email, hashedPassword, phone]
    );

    res.status(201).json({
      message: "Cleaner account created successfully",
      cleaner: result.rows[0],
    });
  } catch (error) {
    console.error("Create cleaner error:", error);

    res.status(500).json({
      message: "Error creating cleaner account",
    });
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
    await ensureBookingAddonsColumns();

    const bookingCheck = await pool.query(
      `
      SELECT
        id,
        payment_status,
        addon_assessment_required,
        addon_assessment_confirmed
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
    message:
      "This booking is already paid. The booking price can no longer be changed.",
  });
}

    const result = await pool.query(
      `
      UPDATE bookings
      SET price=$1,
          addon_assessment_confirmed =
            CASE
              WHEN addon_assessment_required = true THEN true
              ELSE addon_assessment_confirmed
            END,
          addon_assessment_confirmed_at =
            CASE
              WHEN addon_assessment_required = true
                   AND addon_assessment_confirmed = false
              THEN NOW()
              ELSE addon_assessment_confirmed_at
            END
      WHERE id=$2
      RETURNING
        id,
        price,
        addon_assessment_required,
        addon_assessment_confirmed,
        addon_assessment_confirmed_at
      `,
      [Number(price), id]
    );

    res.json({
      message: booking.addon_assessment_required
        ? "Assessment confirmed and final booking price updated successfully ✅"
        : "Booking price updated successfully",
      booking: result.rows[0],
    });
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
      commission = Math.floor(price * 0.18);
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
    const commission = Math.floor(price * 0.18);
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