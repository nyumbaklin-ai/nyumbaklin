const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const { auth, cleanerOnly } = require("../middleware/auth");
const pool = require("../config/db");

// ================= HELPER: GET CURRENT CLEANER =================
const getCurrentCleaner = async (user) => {
  if (user.id) {
    const result = await pool.query(
      `
      SELECT id, email, location, subscription_type, subscription_status, subscription_expiry
      FROM customers
      WHERE id = $1 AND role = 'cleaner'
      `,
      [user.id]
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }
  }

  if (user.email) {
    const result = await pool.query(
      `
      SELECT id, email, location, subscription_type, subscription_status, subscription_expiry
      FROM customers
      WHERE email = $1 AND role = 'cleaner'
      `,
      [user.email]
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }
  }

  return null;
};

// ================= HELPER: CHECK ACTIVE PREMIUM =================
const isPremiumActive = (cleaner) => {
  if (!cleaner) return false;
  if (cleaner.subscription_type !== "premium") return false;
  if (cleaner.subscription_status !== "active") return false;
  if (!cleaner.subscription_expiry) return false;

  return new Date(cleaner.subscription_expiry) > new Date();
};

// ================= HELPER: AUTO-EXPIRE SUBSCRIPTION =================
const normalizeCleanerSubscription = async (cleaner) => {
  if (!cleaner) return null;

  const premiumStillActive = isPremiumActive(cleaner);

  if (
    cleaner.subscription_type === "premium" &&
    cleaner.subscription_status === "active" &&
    !premiumStillActive
  ) {
    const result = await pool.query(
      `
      UPDATE customers
      SET subscription_type = 'ordinary',
          subscription_status = 'inactive'
      WHERE id = $1
      RETURNING id, email, location, subscription_type, subscription_status, subscription_expiry
      `,
      [cleaner.id]
    );

    return result.rows[0];
  }

  return cleaner;
};

// ================= CLEANER REGISTER =================
router.post("/register", async (req, res) => {
  const { email, password, phone } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).send("Email and password are required");
    }

    const existingUser = await pool.query(
      "SELECT * FROM customers WHERE email=$1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).send("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `
      INSERT INTO customers
      (name, email, password, role, phone, subscription_type, subscription_status, subscription_expiry)
      VALUES ($1, $2, $3, 'cleaner', $4, $5, $6, $7)
      `,
      [
        "Cleaner",
        email,
        hashedPassword,
        phone || null,
        "ordinary",
        "inactive",
        null,
      ]
    );

    res.json({
      message: "Cleaner registered successfully",
      role: "cleaner",
    });
  } catch (error) {
    console.error("Cleaner registration error:", error);
    res.status(500).send("Server error");
  }
});

// ================= UPGRADE SUBSCRIPTION =================
router.put("/upgrade-subscription", auth, cleanerOnly, async (req, res) => {
  const { plan } = req.body;

  try {
    if (!plan || (plan !== "weekly" && plan !== "monthly")) {
      return res
        .status(400)
        .send("Plan is required and must be either weekly or monthly");
    }

    let cleaner = await getCurrentCleaner(req.user);

    if (!cleaner) {
      return res.status(404).send("Cleaner not found");
    }

    cleaner = await normalizeCleanerSubscription(cleaner);

    const now = new Date();
    let baseDate = now;

    if (
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
      RETURNING id, email, location, subscription_type, subscription_status, subscription_expiry
      `,
      [newExpiry, cleaner.id]
    );

    res.json({
      message: `Cleaner upgraded to premium successfully (${plan} plan)`,
      cleaner: updateResult.rows[0],
    });
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    res.status(500).send("Server error");
  }
});

// ================= SUBSCRIPTION STATUS =================
router.get("/subscription-status", auth, cleanerOnly, async (req, res) => {
  try {
    let cleaner = await getCurrentCleaner(req.user);

    if (!cleaner) {
      return res.status(404).send("Cleaner not found");
    }

    cleaner = await normalizeCleanerSubscription(cleaner);

    res.json(cleaner);
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    res.status(500).send("Server error");
  }
});

// ================= AVAILABLE JOBS =================
router.get("/available-jobs", auth, cleanerOnly, async (req, res) => {
  try {
    let cleaner = await getCurrentCleaner(req.user);

    if (!cleaner) {
      return res.status(404).send("Cleaner not found");
    }

    cleaner = await normalizeCleanerSubscription(cleaner);

    const premiumActive = isPremiumActive(cleaner);
    const cleanerLocation = (cleaner.location || "").toLowerCase();

    const result = await pool.query(
      `
      SELECT id, email, service, status, cleaner, price, booking_date, address
      FROM bookings
      WHERE cleaner IS NULL AND status = 'pending'
      ORDER BY booking_date ASC
      `
    );

    const jobs = result.rows;

    const scoredJobs = jobs.map((job) => {
      const address = (job.address || "").toLowerCase();
      const hasAddress = job.address ? 1 : 0;
      const matchesLocation =
        cleanerLocation && address.includes(cleanerLocation) ? 1 : 0;

      let priorityScore = 0;

      if (premiumActive) {
        if (matchesLocation) priorityScore += 100;
        if (hasAddress) priorityScore += 20;
      } else {
        if (hasAddress) priorityScore += 10;
      }

      return {
        ...job,
        _priorityScore: priorityScore,
        _matchesLocation: matchesLocation,
      };
    });

    scoredJobs.sort((a, b) => {
      if (b._priorityScore !== a._priorityScore) {
        return b._priorityScore - a._priorityScore;
      }

      return new Date(a.booking_date) - new Date(b.booking_date);
    });

    const visibleJobs = premiumActive ? scoredJobs : scoredJobs.slice(0, 3);

    const cleanedJobs = visibleJobs.map(
      ({ _priorityScore, _matchesLocation, ...job }) => job
    );

    res.json(cleanedJobs);
  } catch (error) {
    console.error("Error fetching available jobs:", error);
    res.status(500).send("Server error");
  }
});

// ================= ACCEPT JOB =================
router.put("/accept-job/:id", auth, cleanerOnly, async (req, res) => {
  const jobId = req.params.id;

  try {
    let cleaner = await getCurrentCleaner(req.user);

    if (!cleaner) {
      return res.status(404).send("Cleaner not found");
    }

    cleaner = await normalizeCleanerSubscription(cleaner);

    const result = await pool.query(
      `
      UPDATE bookings
      SET cleaner = $1,
          status = 'accepted'
      WHERE id = $2
      AND cleaner IS NULL
      RETURNING *
      `,
      [cleaner.email, jobId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Job not found or already accepted");
    }

    res.send("Job accepted successfully");
  } catch (error) {
    console.error("Error accepting job:", error);
    res.status(500).send("Server error");
  }
});

// ================= START JOB =================
router.put("/start-job/:id", auth, cleanerOnly, async (req, res) => {
  const jobId = req.params.id;

  try {
    let cleaner = await getCurrentCleaner(req.user);

    if (!cleaner) {
      return res.status(404).send("Cleaner not found");
    }

    cleaner = await normalizeCleanerSubscription(cleaner);

    const result = await pool.query(
      `
      UPDATE bookings
      SET status = 'in progress'
      WHERE id = $1
      AND cleaner = $2
      AND status = 'accepted'
      RETURNING *
      `,
      [jobId, cleaner.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Job not found or cannot be started");
    }

    res.send("Job started");
  } catch (error) {
    console.error("Error starting job:", error);
    res.status(500).send("Server error");
  }
});

// ================= COMPLETE JOB =================
router.put("/complete-job/:id", auth, cleanerOnly, async (req, res) => {
  const jobId = req.params.id;

  try {
    let cleaner = await getCurrentCleaner(req.user);

    if (!cleaner) {
      return res.status(404).send("Cleaner not found");
    }

    cleaner = await normalizeCleanerSubscription(cleaner);

    const result = await pool.query(
      `
      UPDATE bookings
      SET status = 'completed'
      WHERE id = $1
      AND cleaner = $2
      AND status = 'in progress'
      RETURNING *
      `,
      [jobId, cleaner.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Job not found or cannot be completed");
    }

    res.send("Job completed");
  } catch (error) {
    console.error("Error completing job:", error);
    res.status(500).send("Server error");
  }
});

// ================= MY CLEANER JOBS (WITH PHONE LOGIC) =================
router.get("/my-cleaner-jobs", auth, cleanerOnly, async (req, res) => {
  try {
    let cleaner = await getCurrentCleaner(req.user);

    if (!cleaner) {
      return res.status(404).send("Cleaner not found");
    }

    cleaner = await normalizeCleanerSubscription(cleaner);

    const result = await pool.query(
      `
      SELECT 
        b.id,
        b.email,
        b.service,
        b.status,
        b.price,
        b.booking_date,
        b.address,
        c.phone AS customer_phone
      FROM bookings b
      LEFT JOIN customers c
        ON b.email = c.email
      WHERE b.cleaner = $1
      ORDER BY b.booking_date ASC
      `,
      [cleaner.email]
    );

    const jobs = result.rows.map((job) => ({
      ...job,
      customer_phone:
        job.status === "accepted" ||
        job.status === "in progress" ||
        job.status === "completed"
          ? job.customer_phone
          : null,
    }));

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching cleaner jobs:", error);
    res.status(500).send("Server error");
  }
});

// ================= CLEANER EARNINGS =================
router.get("/earnings", auth, cleanerOnly, async (req, res) => {
  try {
    let cleaner = await getCurrentCleaner(req.user);

    if (!cleaner) {
      return res.status(404).send("Cleaner not found");
    }

    cleaner = await normalizeCleanerSubscription(cleaner);

    const result = await pool.query(
      `
      SELECT 
        COUNT(*) AS total_jobs,
        COALESCE(SUM(price), 0) AS total_value,
        COALESCE(
          SUM(
            CASE
              WHEN cleaner_payout_status = 'paid'
              THEN COALESCE(cleaner_amount, price - FLOOR(price * 0.15))
              ELSE 0
            END
          ), 0
        ) AS total_paid,
        COALESCE(
          SUM(
            CASE
              WHEN cleaner_payout_status IS NULL
                   OR cleaner_payout_status = 'unpaid'
                   OR cleaner_payout_status = 'pending'
              THEN COALESCE(cleaner_amount, price - FLOOR(price * 0.15))
              ELSE 0
            END
          ), 0
        ) AS total_pending
      FROM bookings
      WHERE cleaner = $1
      AND status = 'completed'
      `,
      [cleaner.email]
    );

    const totalJobs = Number(result.rows[0].total_jobs);
    const totalValue = Number(result.rows[0].total_value);
    const totalPaid = Number(result.rows[0].total_paid);
    const totalPending = Number(result.rows[0].total_pending);

    const platformFee = Math.round(totalValue * 0.15);
    const cleanerEarnings = totalValue - platformFee;

    res.json({
      total_jobs: totalJobs,
      total_value: totalValue,
      platform_fee: platformFee,
      cleaner_earnings: cleanerEarnings,
      total_paid: totalPaid,
      total_pending: totalPending,
      subscription_type: cleaner.subscription_type || "ordinary",
      subscription_status: cleaner.subscription_status || "inactive",
      subscription_expiry: cleaner.subscription_expiry || null,
    });
  } catch (error) {
    console.error("Error fetching cleaner earnings:", error);
    res.status(500).send("Server error");
  }
});

module.exports = router;