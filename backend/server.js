const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const pool = require("./config/db");

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  "https://nyumbaklin-frontend.onrender.com",
  "https://www.nyumbaklin.com",
  "https://nyumbaklin.com",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin like mobile apps, curl, postman
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
const customerRoutes = require("./routes/customerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cleanerRoutes = require("./routes/cleanerRoutes");

// Ensure required DB updates exist
async function ensureDatabaseUpdates() {
  try {
    await pool.query(`
      ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER UNIQUE NOT NULL,
        customer_email TEXT NOT NULL,
        cleaner_email TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash'
    `);

    await pool.query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid'
    `);

    await pool.query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS cleaner_payout_status TEXT DEFAULT 'unpaid'
    `);

    await pool.query(`
  ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS gps_readable_location TEXT
`);

    console.log("✅ customers.phone column is ready");
    console.log("✅ ratings table is ready");
    console.log("✅ bookings payment columns are ready");
  } catch (error) {
    console.error("❌ Error ensuring database updates:", error);
  }
}

app.use("/customers", customerRoutes);
app.use("/admin", adminRoutes);
app.use("/cleaner", cleanerRoutes);

// Health route
app.get("/", (req, res) => {
  res.send("Nyumbaklin backend is running");
});

// TEMPORARY DATABASE SETUP ROUTE
app.get("/setup-db", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT,
        phone VARCHAR(20)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        email TEXT,
        service TEXT,
        booking_date DATE,
        booking_time TEXT,
        address TEXT,
        status TEXT DEFAULT 'pending',
        cleaner TEXT,
        seen BOOLEAN DEFAULT false,
        price INTEGER,
        payment_method TEXT DEFAULT 'cash',
        payment_status TEXT DEFAULT 'unpaid',
        cleaner_payout_status TEXT DEFAULT 'unpaid'
      );
    `);

    await pool.query(`
      ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER UNIQUE NOT NULL,
        customer_email TEXT NOT NULL,
        cleaner_email TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash'
    `);

    await pool.query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid'
    `);

    await pool.query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS cleaner_payout_status TEXT DEFAULT 'unpaid'
    `);

    res.send("Tables created successfully");
  } catch (error) {
    console.error("Setup DB error:", error);
    res.status(500).send("Error creating tables");
  }
});

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, async () => {
  console.log("🔥 Nyumbaklin server running on port", PORT);
  console.log("✅ Allowed CORS origins:", allowedOrigins);
  await ensureDatabaseUpdates();
});