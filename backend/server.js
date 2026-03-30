const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const pool = require("./config/db");

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL,
      "https://nyumbaklin-frontend.onrender.com",
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());

// Routes
const customerRoutes = require("./routes/customerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cleanerRoutes = require("./routes/cleanerRoutes");

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
        role TEXT
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
        price INTEGER
      );
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
app.listen(PORT, () => {
  console.log("🔥 Nyumbaklin server running on port", PORT);
});