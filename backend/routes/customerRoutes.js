const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { auth, cleanerOnly } = require("../middleware/auth");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const normalizeText = (value) => String(value || "").trim();
const isValidId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

let bookingAddonsColumnsReady = false;

const ensureBookingAddonsColumns = async () => {
  if (bookingAddonsColumnsReady) return;

  await pool.query(`
    ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS addons JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS addon_total INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS addon_assessment_required BOOLEAN NOT NULL DEFAULT false
    ADD COLUMN IF NOT EXISTS addon_assessment_confirmed BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS addon_assessment_confirmed_at TIMESTAMPTZ
  `);

  bookingAddonsColumnsReady = true;
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

let serviceAddonsReady = false;

const ensureServiceAddonsTable = async () => {
  if (serviceAddonsReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS service_addons (
      id SERIAL PRIMARY KEY,
      service_name VARCHAR(100) NOT NULL,
      addon_code VARCHAR(100) NOT NULL UNIQUE,
      addon_name VARCHAR(150) NOT NULL,
      price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
      requires_assessment BOOLEAN NOT NULL DEFAULT false,
      active BOOLEAN NOT NULL DEFAULT true,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    INSERT INTO service_addons
      (
        service_name,
        addon_code,
        addon_name,
        price,
        requires_assessment,
        sort_order
      )
    VALUES
      (
        'Deep Cleaning',
        'inside_refrigerator',
        'Inside Refrigerator',
        10000,
        false,
        10
      ),
      (
        'Deep Cleaning',
        'inside_oven',
        'Inside Oven',
        10000,
        false,
        20
      ),
      (
        'Deep Cleaning',
        'inside_kitchen_cabinets',
        'Inside Kitchen Cabinets',
        10000,
        false,
        30
      ),
      (
        'Deep Cleaning',
        'wall_sticker_removal',
        'Wall Sticker / Adhesive Removal',
        0,
        true,
        40
      ),
      (
        'Deep Cleaning',
        'heavy_mould_treatment',
        'Heavy Mould / Stain Treatment',
        0,
        true,
        50
      ),
      (
        'Deep Cleaning',
        'extreme_grease_buildup',
        'Extreme Grease Buildup',
        0,
        true,
        60
      ),
      (
        'Deep Cleaning',
        'paint_cement_marks',
        'Paint / Cement / Post-construction Marks',
        0,
        true,
        70
      )
    ON CONFLICT (addon_code) DO NOTHING
  `);

  serviceAddonsReady = true;
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

// ================= REQUEST ACCOUNT DELETION =================
router.post("/request-account-deletion", auth, async (req, res) => {
  try {
    await pool.query(`
      ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS deletion_requested BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ
    `);

    const result = await pool.query(
      `
      UPDATE customers
      SET deletion_requested = true,
          deletion_requested_at = NOW()
      WHERE email = $1
      AND role = 'customer'
      RETURNING id, email, deletion_requested
      `,
      [req.user.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Customer account not found",
      });
    }

    res.json({
      message:
        "Your account deletion request has been submitted. Nyumbaklin support will review it.",
    });
  } catch (error) {
    console.error("Account deletion request error:", error);
    res.status(500).json({
      message: "Error submitting account deletion request",
    });
  }
});

// ================= OLD BOOKING ROUTE DISABLED =================
router.post("/book", auth, async (req, res) => {
  return res.status(410).json({
    message:
      "This booking route is no longer available. Please use the current booking service.",
  });
});

// ================= CUSTOMER JOB TRACKING =================
router.get("/my-bookings", auth, async (req, res) => {
  try {
    await ensureManualPaymentColumns();
    await ensureBookingAddonsColumns();

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
        b.addons,
        b.addon_total,
        b.addon_assessment_required,
        b.addon_assessment_confirmed,
        b.addon_assessment_confirmed_at,
        c.phone AS cleaner_phone,
        r.rating AS submitted_rating,
        c.profile_photo_url AS cleaner_photo_url,
        r.review AS submitted_review
      FROM bookings b
      LEFT JOIN customers c
        ON b.cleaner = c.email
      LEFT JOIN ratings r
        ON b.id = r.booking_id
      WHERE b.email = $1
      AND (customer_hidden IS NULL OR customer_hidden = false)
      ORDER BY b.id DESC
      `,
      [req.user.email]
    );

    const bookings = result.rows.map((b) => {
  const cleanerVisible =
    b.status === "accepted" ||
    b.status === "in progress" ||
    b.status === "completed";

  return {
    ...b,
    cleaner_phone: cleanerVisible ? b.cleaner_phone : null,
    cleaner_photo_url: cleanerVisible ? b.cleaner_photo_url : null,
  };
});

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
      SELECT id, service, booking_date, booking_time, address, gps_readable_location, price, addons, addon_total, addon_assessment_required
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
      `SELECT id, service, booking_date, booking_time, address, gps_readable_location, status, price, addons, addon_total, addon_assessment_required
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

// ================= CURRENT SERVICE PRICES =================
router.get("/service-prices", auth, async (req, res) => {
  try {
    await ensureServicePricesTable();

    const result = await pool.query(`
      SELECT id, service_name, option_label, booking_service, price, sort_order
      FROM service_prices
      ORDER BY sort_order ASC, id ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch customer service prices error:", error);
    res.status(500).json({ message: "Error fetching service prices" });
  }
});

// ================= CURRENT SERVICE ADD-ONS =================
router.get("/service-addons", auth, async (req, res) => {
  try {
    await ensureServiceAddonsTable();

    const serviceName = normalizeText(req.query.service_name);

    if (!serviceName) {
      return res.status(400).json({
        message: "Service name is required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        service_name,
        addon_code,
        addon_name,
        price,
        requires_assessment,
        sort_order
      FROM service_addons
      WHERE service_name = $1
      AND active = true
      ORDER BY sort_order ASC, id ASC
      `,
      [serviceName]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch service add-ons error:", error);
    res.status(500).json({
      message: "Error fetching service add-ons",
    });
  }
});

const calculateDeepCleaningAddonTotal = (selectedAddons) => {
  const selectedCodes = selectedAddons.map((addon) => addon.addon_code);

  const fixedAddonCodes = [
    "inside_refrigerator",
    "inside_oven",
    "inside_kitchen_cabinets",
  ];

  const hasAllThreeFixedAddons = fixedAddonCodes.every((code) =>
    selectedCodes.includes(code)
  );

  if (hasAllThreeFixedAddons) {
    return 25000;
  }

  return selectedAddons.reduce((total, addon) => {
    if (addon.requires_assessment) {
      return total;
    }

    return total + Number(addon.price || 0);
  }, 0);
};

// ================= BOOK CLEANING SERVICE =================
router.post("/book-service", auth, async (req, res) => {
  try {
    await ensureServicePricesTable();
    await ensureServiceAddonsTable();
    await ensureBookingAddonsColumns();

    const service = normalizeText(req.body.service);
    const booking_date = req.body.booking_date;
    const requestedPrice = Number(req.body.price);
    const address = normalizeText(req.body.address);
    const payment_method =
      normalizeText(req.body.payment_method) || "pay_after";
    const gps_readable_location =
      normalizeText(req.body.gps_readable_location) || null;

      const requestedAddonCodes = Array.isArray(req.body.addons)
  ? [...new Set(
      req.body.addons
        .map((code) => normalizeText(code))
        .filter(Boolean)
    )]
  : [];

    const allowedPaymentMethods = [
      "pay_after",
      "momo",
      "cash",
      "mobile_money",
      "manual_mobile_money",
    ];

    if (!service || !booking_date || !address) {
      return res.status(400).json({
        message: "Service, date, and location are required",
      });
    }

    if (!allowedPaymentMethods.includes(payment_method)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    let selectedAddons = [];

if (requestedAddonCodes.length > 0) {
  if (!service.startsWith("Deep Cleaning (")) {
    return res.status(400).json({
      message: "Add-ons are currently available only for Deep Cleaning.",
    });
  }

  const addonsResult = await pool.query(
    `
    SELECT
      addon_code,
      addon_name,
      price,
      requires_assessment
    FROM service_addons
    WHERE service_name = 'Deep Cleaning'
    AND addon_code = ANY($1::text[])
    AND active = true
    `,
    [requestedAddonCodes]
  );

  selectedAddons = addonsResult.rows;

  if (selectedAddons.length !== requestedAddonCodes.length) {
    return res.status(400).json({
      message:
        "One or more selected add-ons are not available. Please refresh the booking page and try again.",
    });
  }
}

const addonTotal = calculateDeepCleaningAddonTotal(selectedAddons);

const addonAssessmentRequired = selectedAddons.some(
  (addon) => addon.requires_assessment === true
);

const addonsForStorage = selectedAddons.map((addon) => ({
  addon_code: addon.addon_code,
  addon_name: addon.addon_name,
  price: addon.requires_assessment ? 0 : Number(addon.price),
  requires_assessment: addon.requires_assessment,
}));

    const managedServiceNames = [
      "House Cleaning",
      "Deep Cleaning",
      "Office Cleaning",
      "Sofa Set Cleaning",
      "Carpet Cleaning",
      "Mobile Car Washing",
    ];

    const officialPriceResult = await pool.query(
      `
      SELECT price
      FROM service_prices
      WHERE booking_service=$1
      LIMIT 1
      `,
      [service]
    );

    let finalPrice;

    if (officialPriceResult.rows.length > 0) {
  const baseServicePrice = Number(officialPriceResult.rows[0].price);

  if (
    !Number.isFinite(requestedPrice) ||
    requestedPrice !== baseServicePrice
  ) {
    return res.status(409).json({
      message:
        "The price for this service has changed. Please refresh the booking page and confirm the current price before booking.",
    });
  }

  finalPrice = baseServicePrice + addonTotal;
    } else {
      const looksLikeManagedService = managedServiceNames.some(
        (serviceName) =>
          service === serviceName ||
          service.startsWith(`${serviceName} (`)
      );

      if (looksLikeManagedService) {
        return res.status(400).json({
          message:
            "This service option is not available. Please refresh the booking page and try again.",
        });
      }

      if (
        !Number.isFinite(requestedPrice) ||
        requestedPrice <= 0
      ) {
        return res.status(400).json({
          message: "Please enter a valid price for the custom service",
        });
      }

      finalPrice = requestedPrice;
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
    gps_readable_location,
    addons,
    addon_total,
    addon_assessment_required
  )
  VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    'pending',
    $6,
    $7,
    $8::jsonb,
    $9,
    $10
  )
  RETURNING *
  `,
  [
    email,
    service,
    booking_date,
    address,
    finalPrice,
    payment_method,
    gps_readable_location,
    JSON.stringify(addonsForStorage),
    addonTotal,
    addonAssessmentRequired,
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

// ================= CUSTOMER HIDE BOOKING =================
router.put("/hide-booking/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }

  try {
    const result = await pool.query(
      `
      UPDATE bookings
      SET customer_hidden = true
      WHERE id = $1
      AND email = $2
      RETURNING id
      `,
      [id, req.user.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      message: "Booking removed from history successfully",
    });
  } catch (error) {
    console.error("Hide booking error:", error);
    res.status(500).json({ message: "Error removing booking" });
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