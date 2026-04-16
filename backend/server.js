const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const pool = require("./config/db");

// Trust proxy for Render / production reverse proxy
app.set("trust proxy", 1);

// Hide Express signature
app.disable("x-powered-by");

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  "https://nyumbaklin-frontend.onrender.com",
  "https://www.nyumbaklin.com",
  "https://nyumbaklin.com",
].filter(Boolean);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many attempts. Please wait a few minutes and try again.",
  },
});

const adminSetupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many admin setup attempts. Please try again later.",
  },
});

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

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

app.use(express.json({ limit: "1mb" }));

// Routes
const customerRoutes = require("./routes/customerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cleanerRoutes = require("./routes/cleanerRoutes");

// Rate limit only sensitive auth/setup routes
app.use("/customers/login", authLimiter);
app.use("/customers/register", authLimiter);
app.use("/cleaner/register", authLimiter);
app.use("/customers/setup-admin", adminSetupLimiter);

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
    console.log("✅ bookings gps_readable_location column is ready");
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

// CORS / unexpected error handler
app.use((err, req, res, next) => {
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Not allowed by CORS" });
  }

  if (err) {
    console.error("Server error:", err);
    return res.status(500).json({ message: "Server error" });
  }

  next();
});

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, async () => {
  console.log("🔥 Nyumbaklin server running on port", PORT);
  console.log("✅ Allowed CORS origins:", allowedOrigins);
  await ensureDatabaseUpdates();
});