const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const customerRoutes = require("./routes/customerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cleanerRoutes = require("./routes/cleanerRoutes");

app.use("/customers", customerRoutes);
app.use("/admin", adminRoutes);
app.use("/cleaner", cleanerRoutes);

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log("🔥 Nyumbaklin server running on port", PORT);
});