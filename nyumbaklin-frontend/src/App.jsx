import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation, Link } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CleanerDashboard from "./pages/CleanerDashboard";
import CleanerMyJobs from "./pages/CleanerMyJobs";
import CleanerEarnings from "./pages/CleanerEarnings";
import CustomerBooking from "./pages/CustomerBooking";
import CustomerMyBookings from "./pages/CustomerMyBookings";
import Profile from "./pages/Profile";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";

const API_URL = import.meta.env.VITE_API_URL;


const authPageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #ecfeff 100%)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
};

const authCardStyle = {
  width: "100%",
  maxWidth: "440px",
  background: "rgba(255,255,255,0.95)",
  backdropFilter: "blur(8px)",
  padding: "32px",
  borderRadius: "18px",
  boxShadow: "0 20px 40px rgba(15, 23, 42, 0.10)",
  border: "1px solid #e5e7eb",
};

const authInputStyle = {
  width: "100%",
  padding: "13px 14px",
  marginBottom: "15px",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  fontSize: "15px",
  boxSizing: "border-box",
  background: "#ffffff",
};

const primaryButtonStyle = {
  width: "100%",
  background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
  color: "white",
  border: "none",
  padding: "13px",
  borderRadius: "10px",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 10px 18px rgba(37, 99, 235, 0.20)",
};

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/customers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        if (data.role === "cleaner") {
          navigate("/cleaner/dashboard");
        } else if (data.role === "admin") {
          navigate("/dashboard");
        } else if (data.role === "customer") {
          navigate("/book-service");
        }
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong during login");
    }
  };

  return (
    <div style={authPageStyle}>
      <div style={authCardStyle}>
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <h1 style={{ margin: 0, color: "#0f172a", fontSize: "32px" }}>Nyumbaklin</h1>
          <p style={{ marginTop: "10px", color: "#64748b" }}>
            Sign in to manage bookings, jobs, and earnings.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={authInputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={authInputStyle}
          />

          <button type="submit" style={primaryButtonStyle}>
            Login
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center", color: "#475569" }}>
          <p style={{ marginBottom: "12px" }}>Don&apos;t have an account?</p>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <Link
              to="/register"
              style={{
                color: "#2563eb",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Customer Register
            </Link>

            <Link
              to="/cleaner-register"
              style={{
                color: "#16a34a",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Cleaner Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/customers/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Registration successful");
        navigate("/");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong during registration");
    }
  };

  return (
    <div style={authPageStyle}>
      <div style={authCardStyle}>
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "28px" }}>Customer Registration</h2>
          <p style={{ marginTop: "10px", color: "#64748b" }}>
            Create your customer account to start booking cleaning services.
          </p>
        </div>

        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={authInputStyle}
          />

          <input
            type="text"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={authInputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={authInputStyle}
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={authInputStyle}
          />

          <button
            type="submit"
            style={{
              ...primaryButtonStyle,
              background: "linear-gradient(90deg, #16a34a, #15803d)",
              boxShadow: "0 10px 18px rgba(22, 163, 74, 0.20)",
            }}
          >
            Register
          </button>
        </form>

        <p style={{ marginTop: "18px", textAlign: "center", color: "#475569" }}>
          Already have an account?{" "}
          <Link
            to="/"
            style={{
              color: "#2563eb",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

function CleanerRegister() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleCleanerRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cleaner/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Cleaner registration successful");
        navigate("/");
      } else {
        alert(data.message || "Cleaner registration failed");
      }
    } catch (error) {
      console.error("Cleaner registration error:", error);
      alert("Something went wrong during cleaner registration");
    }
  };

  return (
    <div style={authPageStyle}>
      <div style={authCardStyle}>
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "28px" }}>Cleaner Registration</h2>
          <p style={{ marginTop: "10px", color: "#64748b" }}>
            Join Nyumbaklin as a cleaner and start receiving jobs.
          </p>
        </div>

        <form onSubmit={handleCleanerRegister}>
          <input
            type="email"
            placeholder="Cleaner email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={authInputStyle}
          />

          <input
            type="text"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={authInputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={authInputStyle}
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={authInputStyle}
          />

          <button
            type="submit"
            style={{
              ...primaryButtonStyle,
              background: "linear-gradient(90deg, #16a34a, #15803d)",
              boxShadow: "0 10px 18px rgba(22, 163, 74, 0.20)",
            }}
          >
            Register as Cleaner
          </button>
        </form>

        <p style={{ marginTop: "18px", textAlign: "center", color: "#475569" }}>
          Already have an account?{" "}
          <Link
            to="/"
            style={{
              color: "#2563eb",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

const getDefaultRouteByRole = (role) => {
  if (role === "admin") return "/dashboard";
  if (role === "cleaner") return "/cleaner/dashboard";
  if (role === "customer") return "/book-service";
  return "/";
};

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return <Navigate to="/" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token && role) {
    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }

  return children;
}

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [ratings, setRatings] = useState([]);

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");

  const token = localStorage.getItem("token");
  
const readResponseMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

  const fetchUsers = () => {
    fetch(`${API_URL}/admin/users`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  };

  const fetchBookings = () => {
    fetch(`${API_URL}/admin/bookings`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Error fetching bookings:", error);
      });
  };

  const fetchStats = () => {
    fetch(`${API_URL}/admin/stats`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data || {});
      })
      .catch((error) => {
        console.error("Error fetching stats:", error);
      });
  };

  const fetchRatings = () => {
    fetch(`${API_URL}/admin/ratings`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setRatings(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Error fetching ratings:", error);
        setRatings([]);
      });
  };

  useEffect(() => {
    fetchUsers();
    fetchBookings();
    fetchStats();
    fetchRatings();
  }, []);

    const deleteUser = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/delete-user/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const message = await readResponseMessage(
        response,
        response.ok ? "User deleted successfully" : "Error deleting user"
      );

      alert(message);

      if (response.ok) {
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

    const changeUserRole = async (id, currentRole) => {
  const newRole = window.prompt(
    "Enter new role for this user (cleaner or customer):",
    currentRole
  );

  if (newRole === null) {
    return;
  }

  const cleanedRole = newRole.trim().toLowerCase();

  if (cleanedRole !== "cleaner" && cleanedRole !== "customer") {
    alert("Please enter a valid role: cleaner or customer");
    return;
  }

  if (cleanedRole === currentRole) {
    alert("This user already has that role");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/admin/change-role/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ role: cleanedRole }),
    });

    const message = await readResponseMessage(
      response,
      response.ok ? "User role updated successfully" : "Error changing user role"
    );

    alert(message);

    if (response.ok) {
      fetchUsers();
      fetchStats();
    }
  } catch (error) {
    console.error("Error changing user role:", error);
    alert("Error changing user role");
  }
};

    const deleteBooking = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this booking?");

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/delete-booking/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const message = await readResponseMessage(
        response,
        response.ok ? "Booking deleted successfully" : "Error deleting booking"
      );

      alert(message);

      if (response.ok) {
        fetchBookings();
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Error deleting booking");
    }
  };

    const updatePrice = async (id, currentPrice) => {
    const newPrice = window.prompt("Enter new price:", currentPrice);

    if (newPrice === null) {
      return;
    }

    if (newPrice.trim() === "" || isNaN(newPrice) || Number(newPrice) < 0) {
      alert("Please enter a valid price");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/update-price/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ price: Number(newPrice) }),
      });

      const message = await readResponseMessage(
        response,
        response.ok ? "Booking price updated successfully" : "Error updating price"
      );

      alert(message);

      if (response.ok) {
        fetchBookings();
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating price:", error);
      alert("Error updating price");
    }
  };

    const updatePayment = async (id, currentMethod) => {
    const method = window.prompt(
      "Enter payment method (cash or mobile_money):",
      currentMethod || "cash"
    );

    if (method === null) {
      return;
    }

    const cleanedMethod = method.trim().toLowerCase();

    if (cleanedMethod !== "cash" && cleanedMethod !== "mobile_money") {
      alert("Invalid payment method");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/update-payment-status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          payment_status: "paid",
          payment_method: cleanedMethod,
        }),
      });

      const message = await readResponseMessage(
        response,
        response.ok ? "Payment status updated successfully" : "Error updating payment"
      );

      alert(message);

      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Error updating payment");
    }
  };
    const markCleanerPaid = async (id) => {
    try {
      const response = await fetch(`${API_URL}/admin/update-payout-status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          cleaner_payout_status: "paid",
        }),
      });

      const message = await readResponseMessage(
        response,
        response.ok ? "Cleaner paid successfully" : "Error updating cleaner payout"
      );

      alert(message);

      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error updating cleaner payout:", error);
      alert("Error updating cleaner payout");
    }
  };
  

  const getStatusStyle = (status) => {
    if (status === "pending") {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    if (status === "accepted") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    if (status === "in progress") {
      return {
        background: "#ede9fe",
        color: "#6d28d9",
      };
    }

    if (status === "completed") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    return {
      background: "#e5e7eb",
      color: "#374151",
    };
  };

  const getRoleStyle = (role) => {
    if (role === "admin") {
      return {
        background: "#fee2e2",
        color: "#b91c1c",
      };
    }

    if (role === "cleaner") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    return {
      background: "#dcfce7",
      color: "#166534",
    };
  };

  const getPaymentBadgeStyle = (status) => {
    if (status === "paid") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    return {
      background: "#fee2e2",
      color: "#b91c1c",
    };
  };

  const getPaymentMethodStyle = (method) => {
    if (method === "mobile_money") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  };

  const parseGpsAddress = (address) => {
  if (!address || typeof address !== "string") return null;

  const match = address.match(
    /^GPS:\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)(?:\s*\(Accuracy:\s*(\d+)m\))?$/i
  );

  if (!match) return null;

  return {
    latitude: match[1],
    longitude: match[2],
    accuracy: match[3] || "",
  };
};

const getGoogleMapsLink = (latitude, longitude) => {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

  const filteredUsers = users.filter((user) => {
    const emailText = user.email ? user.email.toLowerCase() : "";
    const phoneText = user.phone ? user.phone.toLowerCase() : "";

    const matchesSearch =
      emailText.includes(userSearch.toLowerCase()) ||
      phoneText.includes(userSearch.toLowerCase());

    const matchesRole =
      userRoleFilter === "all" || user.role === userRoleFilter;

    return matchesSearch && matchesRole;
  });

  const filteredBookings = bookings.filter((booking) => {
    const emailText = booking.email ? booking.email.toLowerCase() : "";
    const serviceText = booking.service ? booking.service.toLowerCase() : "";
    const addressText = booking.address ? booking.address.toLowerCase() : "";
    const gpsReadableText = booking.gps_readable_location
  ? booking.gps_readable_location.toLowerCase()
  : "";
    const customerPhoneText = booking.customer_phone ? booking.customer_phone.toLowerCase() : "";
    const cleanerPhoneText = booking.cleaner_phone ? booking.cleaner_phone.toLowerCase() : "";

    const matchesSearch =
      emailText.includes(bookingSearch.toLowerCase()) ||
      serviceText.includes(bookingSearch.toLowerCase()) ||
      addressText.includes(bookingSearch.toLowerCase()) ||
      gpsReadableText.includes(bookingSearch.toLowerCase()) ||
      customerPhoneText.includes(bookingSearch.toLowerCase()) ||
      cleanerPhoneText.includes(bookingSearch.toLowerCase());

    const matchesStatus =
      bookingStatusFilter === "all" || booking.status === bookingStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed"
  );

  const totalCompletedValue = completedBookings.reduce(
    (sum, booking) => sum + Number(booking.price || 0),
    0
  );

  const totalPlatformRevenue = Math.round(totalCompletedValue * 0.15);
  const totalCleanerPayout = totalCompletedValue - totalPlatformRevenue;
  const pendingJobs = bookings.filter((booking) => booking.status === "pending").length;
  const inProgressJobs = bookings.filter((booking) => booking.status === "in progress").length;

  const pageStyle = {
    padding: "32px 24px",
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
    minHeight: "100vh",
  };

  const cardStyle = {
    borderRadius: "18px",
    padding: "22px",
    background: "rgba(255,255,255,0.96)",
    boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e5e7eb",
  };

  const sectionStyle = {
    background: "rgba(255,255,255,0.97)",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e5e7eb",
    marginTop: "30px",
    overflowX: "auto",
  };

  const tableHeaderStyle = {
    background: "#f8fafc",
    color: "#0f172a",
    fontWeight: "700",
    textAlign: "left",
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
  };

  const tableCellStyle = {
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "middle",
    color: "#334155",
    wordBreak: "break-word",
  };

  const actionButtonStyle = {
    color: "white",
    border: "none",
    padding: "9px 14px",
    cursor: "pointer",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "13px",
  };

  const inputStyle = {
    padding: "11px 13px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "14px",
    minWidth: "220px",
    background: "#ffffff",
  };

  const selectStyle = {
    padding: "11px 13px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "14px",
    minWidth: "180px",
    background: "#ffffff",
  };

const adminGpsBoxStyle = {
  background: "#ecfeff",
  border: "1px solid #a5f3fc",
  borderRadius: "12px",
  padding: "10px",
  minWidth: "210px",
};

const adminGpsBadgeStyle = {
  display: "inline-block",
  background: "#cffafe",
  color: "#155e75",
  padding: "5px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "700",
  marginBottom: "8px",
};

const adminGpsLabelStyle = {
  color: "#64748b",
  fontSize: "12px",
  marginBottom: "2px",
  fontWeight: "600",
};

const adminGpsValueStyle = {
  color: "#0f172a",
  fontSize: "14px",
  fontWeight: "700",
  marginBottom: "8px",
  wordBreak: "break-word",
};

const adminGpsMapLinkStyle = {
  display: "inline-block",
  marginTop: "6px",
  background: "#0f766e",
  color: "white",
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  fontWeight: "700",
  fontSize: "12px",
};

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: 0, color: "#0f172a", fontSize: "34px" }}>Admin Dashboard</h1>
        <p style={{ marginTop: "10px", color: "#64748b", fontSize: "15px" }}>
          Manage users, bookings, pricing, platform commission, payments, and ratings for Nyumbaklin.
        </p>
      </div>

      <div
        style={{
          ...cardStyle,
          marginBottom: "22px",
          background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
          color: "white",
        }}
      >
        <p style={{ margin: 0, opacity: 0.85, fontSize: "14px" }}>Your platform profit</p>
        <h2 style={{ margin: "10px 0 0 0", fontSize: "40px" }}>
          UGX {totalPlatformRevenue.toLocaleString()}
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#475569" }}>Total Users</h3>
          <p style={{ fontSize: "32px", fontWeight: "800", margin: 0, color: "#0f172a" }}>
            {stats.totalUsers ?? 0}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#475569" }}>Total Bookings</h3>
          <p style={{ fontSize: "32px", fontWeight: "800", margin: 0, color: "#0f172a" }}>
            {stats.totalBookings ?? 0}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#475569" }}>Total Cleaners</h3>
          <p style={{ fontSize: "32px", fontWeight: "800", margin: 0, color: "#0f172a" }}>
            {stats.totalCleaners ?? 0}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#475569" }}>Total Customers</h3>
          <p style={{ fontSize: "32px", fontWeight: "800", margin: 0, color: "#0f172a" }}>
            {stats.totalCustomers ?? 0}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#475569" }}>Completed Job Value</h3>
          <p style={{ fontSize: "32px", fontWeight: "800", margin: 0, color: "#0f172a" }}>
            UGX {totalCompletedValue.toLocaleString()}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#475569" }}>Platform Revenue (15%)</h3>
          <p style={{ fontSize: "32px", fontWeight: "800", margin: 0, color: "#dc2626" }}>
            UGX {totalPlatformRevenue.toLocaleString()}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#475569" }}>Cleaner Payouts</h3>
          <p style={{ fontSize: "32px", fontWeight: "800", margin: 0, color: "#15803d" }}>
            UGX {totalCleanerPayout.toLocaleString()}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#475569" }}>Pending Jobs</h3>
          <p style={{ fontSize: "32px", fontWeight: "800", margin: 0, color: "#b45309" }}>
            {pendingJobs}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#475569" }}>In Progress Jobs</h3>
          <p style={{ fontSize: "32px", fontWeight: "800", margin: 0, color: "#7c3aed" }}>
            {inProgressJobs}
          </p>
        </div>
      </div>

      <div style={sectionStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "28px" }}>All Users</h2>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="Search by email or phone"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              style={inputStyle}
            />

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="cleaner">Cleaner</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>ID</th>
              <th style={tableHeaderStyle}>Email</th>
              <th style={tableHeaderStyle}>Phone</th>
              <th style={tableHeaderStyle}>Role</th>
              <th style={tableHeaderStyle}>Subscription</th>
              <th style={tableHeaderStyle}>Sub Status</th>
              <th style={tableHeaderStyle}>Expiry</th>
              <th style={tableHeaderStyle}>Change Role</th>
              <th style={tableHeaderStyle}>Delete</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td style={tableCellStyle} colSpan="9">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} style={{ background: "#fff" }}>
                  <td style={tableCellStyle}>{user.id}</td>
                  <td style={tableCellStyle}>{user.email}</td>
                  <td style={tableCellStyle}>{user.phone || "Not provided"}</td>
                  <td style={tableCellStyle}>
                    <span
                      style={{
                        ...getRoleStyle(user.role),
                        padding: "7px 12px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: "700",
                        textTransform: "capitalize",
                      }}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td style={tableCellStyle}>
                    {user.role === "cleaner" ? (
                      <span
                        style={{
                          background:
                            user.subscription_type === "premium" ? "#dbeafe" : "#f3f4f6",
                          color:
                            user.subscription_type === "premium" ? "#1d4ed8" : "#374151",
                          padding: "7px 12px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: "700",
                          textTransform: "capitalize",
                        }}
                      >
                        {user.subscription_type || "ordinary"}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td style={tableCellStyle}>
                    {user.role === "cleaner" ? (
                      <span
                        style={{
                          background:
                            user.subscription_status === "active" ? "#dcfce7" : "#fee2e2",
                          color:
                            user.subscription_status === "active" ? "#166534" : "#b91c1c",
                          padding: "7px 12px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: "700",
                          textTransform: "capitalize",
                        }}
                      >
                        {user.subscription_status || "inactive"}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td style={tableCellStyle}>
                    {user.role === "cleaner"
                      ? user.subscription_expiry
                        ? new Date(user.subscription_expiry).toLocaleDateString()
                        : "—"
                      : "—"}
                  </td>

                  <td style={tableCellStyle}>
                    <button
                      onClick={() => changeUserRole(user.id, user.role)}
                      style={{
                        ...actionButtonStyle,
                        background: "#2563eb",
                      }}
                    >
                      Change Role
                    </button>
                  </td>

                  <td style={tableCellStyle}>
                    <button
                      onClick={() => deleteUser(user.id)}
                      style={{
                        ...actionButtonStyle,
                        background: "#dc2626",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "28px" }}>All Bookings</h2>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="Search by email, service, location or phone"
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              style={inputStyle}
            />

            <select
              value={bookingStatusFilter}
              onChange={(e) => setBookingStatusFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "2400px" }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>ID</th>
              <th style={tableHeaderStyle}>Email</th>
              <th style={tableHeaderStyle}>Customer Phone</th>
              <th style={tableHeaderStyle}>Service</th>
              <th style={tableHeaderStyle}>Location / Area</th>
              <th style={tableHeaderStyle}>Status</th>
              <th style={tableHeaderStyle}>Cleaner</th>
              <th style={tableHeaderStyle}>Cleaner Phone</th>
              <th style={tableHeaderStyle}>Price</th>
              <th style={tableHeaderStyle}>Platform Fee</th>
              <th style={tableHeaderStyle}>Cleaner Payout</th>
              <th style={tableHeaderStyle}>Payment Method</th>
              <th style={tableHeaderStyle}>Payment Status</th>
              <th style={tableHeaderStyle}>Cleaner Paid</th>
              <th style={tableHeaderStyle}>Date</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td style={tableCellStyle} colSpan="16">
                  No bookings found
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => {
                const bookingPrice = Number(booking.price || 0);
                const platformFee =
                  booking.status === "completed"
                    ? Math.round(bookingPrice * 0.15)
                    : 0;
                const cleanerPayout =
                  booking.status === "completed"
                    ? bookingPrice - platformFee
                    : 0;

                const paymentMethod = booking.payment_method || "cash";
                const paymentStatus = booking.payment_status || "unpaid";
                const cleanerPayoutStatus = booking.cleaner_payout_status || "unpaid";
                const gpsLocation = parseGpsAddress(booking.address);

                return (
                  <tr key={booking.id} style={{ background: "#fff" }}>
                    <td style={tableCellStyle}>{booking.id}</td>
                    <td style={tableCellStyle}>{booking.email}</td>
                    <td style={tableCellStyle}>{booking.customer_phone || "Not provided"}</td>
                    <td style={tableCellStyle}>{booking.service}</td>
                    <td style={tableCellStyle}>
  {gpsLocation ? (
    <div style={adminGpsBoxStyle}>
      <div style={adminGpsBadgeStyle}>GPS Location</div>

      <div style={adminGpsLabelStyle}>Latitude</div>
      <div style={adminGpsValueStyle}>{gpsLocation.latitude}</div>

      <div style={adminGpsLabelStyle}>Longitude</div>
      <div style={adminGpsValueStyle}>{gpsLocation.longitude}</div>

      {gpsLocation.accuracy && (
        <>
          <div style={adminGpsLabelStyle}>Accuracy</div>
          <div style={adminGpsValueStyle}>{gpsLocation.accuracy} meters</div>
        </>
      )}

      {booking.gps_readable_location && (
  <>
    <div style={adminGpsLabelStyle}>Approx Area</div>
    <div style={adminGpsValueStyle}>{booking.gps_readable_location}</div>
  </>
)}

      <a
        href={getGoogleMapsLink(gpsLocation.latitude, gpsLocation.longitude)}
        target="_blank"
        rel="noreferrer"
        style={adminGpsMapLinkStyle}
      >
        Open in Google Maps
      </a>
    </div>
  ) : (
    booking.address || "Not provided"
  )}
</td>
                    <td style={tableCellStyle}>
                      <span
                        style={{
                          ...getStatusStyle(booking.status),
                          padding: "7px 12px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: "700",
                          display: "inline-block",
                          textTransform: "capitalize",
                        }}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{booking.cleaner || "Not assigned"}</td>
                    <td style={tableCellStyle}>{booking.cleaner_phone || "Not available"}</td>
                    <td style={tableCellStyle}>
                      <strong>UGX {bookingPrice.toLocaleString()}</strong>
                    </td>
                    <td style={tableCellStyle}>
                      {booking.status === "completed"
                        ? `UGX ${platformFee.toLocaleString()}`
                        : "-"}
                    </td>
                    <td style={tableCellStyle}>
                      {booking.status === "completed"
                        ? `UGX ${cleanerPayout.toLocaleString()}`
                        : "-"}
                    </td>
                    <td style={tableCellStyle}>
                      <span
                        style={{
                          ...getPaymentMethodStyle(paymentMethod),
                          padding: "7px 12px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: "700",
                          display: "inline-block",
                        }}
                      >
                        {paymentMethod === "pay_after"
  ? "Pay After Service"
  : paymentMethod === "momo" || paymentMethod === "mobile_money"
  ? "Mobile Money"
  : paymentMethod === "cash"
  ? "Cash"
 : paymentMethod}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <span
                        style={{
                          ...getPaymentBadgeStyle(paymentStatus),
                          padding: "7px 12px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: "700",
                          display: "inline-block",
                        }}
                      >
                        {paymentStatus}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <span
                        style={{
                          ...getPaymentBadgeStyle(cleanerPayoutStatus),
                          padding: "7px 12px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: "700",
                          display: "inline-block",
                        }}
                      >
                        {cleanerPayoutStatus}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => updatePrice(booking.id, booking.price)}
                          style={{
                            ...actionButtonStyle,
                            background: "#16a34a",
                          }}
                        >
                          Price
                        </button>

                        <button
                          onClick={() => updatePayment(booking.id, booking.payment_method)}
                          style={{
                            ...actionButtonStyle,
                            background: "#2563eb",
                          }}
                        >
                          Mark Paid
                        </button>

                        {booking.cleaner_payout_status === "paid" ? (
  <span
    style={{
      background: "#dcfce7",
      color: "#166534",
      padding: "9px 14px",
      borderRadius: "8px",
      fontWeight: "700",
      fontSize: "13px",
      display: "inline-block",
    }}
  >
    Cleaner Paid
  </span>
) : (
  <button
    onClick={() => markCleanerPaid(booking.id)}
    style={{
      ...actionButtonStyle,
      background: "#7c3aed",
    }}
  >
    Pay Cleaner
  </button>
)}

                        <button
                          onClick={() => deleteBooking(booking.id)}
                          style={{
                            ...actionButtonStyle,
                            background: "#dc2626",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "28px" }}>Customer Ratings</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Reviews submitted by customers after completed jobs.
          </p>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1200px" }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>ID</th>
              <th style={tableHeaderStyle}>Booking ID</th>
              <th style={tableHeaderStyle}>Customer Email</th>
              <th style={tableHeaderStyle}>Cleaner Email</th>
              <th style={tableHeaderStyle}>Rating</th>
              <th style={tableHeaderStyle}>Review</th>
              <th style={tableHeaderStyle}>Date</th>
            </tr>
          </thead>

          <tbody>
            {ratings.length === 0 ? (
              <tr>
                <td style={tableCellStyle} colSpan="7">
                  No ratings submitted yet
                </td>
              </tr>
            ) : (
              ratings.map((rating) => (
                <tr key={rating.id} style={{ background: "#fff" }}>
                  <td style={tableCellStyle}>{rating.id}</td>
                  <td style={tableCellStyle}>#{rating.booking_id}</td>
                  <td style={tableCellStyle}>{rating.customer_email}</td>
                  <td style={tableCellStyle}>{rating.cleaner_email}</td>
                  <td style={tableCellStyle}>
                    <span
                      style={{
                        background: "#fef3c7",
                        color: "#92400e",
                        padding: "7px 12px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: "700",
                        display: "inline-block",
                      }}
                    >
                      {rating.rating} ★
                    </span>
                  </td>
                  <td style={tableCellStyle}>{rating.review || "No review"}</td>
                  <td style={tableCellStyle}>
                    {new Date(rating.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Layout({ children }) {
  const location = useLocation();

  if (
    location.pathname === "/" ||
    location.pathname === "/register" ||
    location.pathname === "/cleaner-register"
  ) {
    return children;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route
  path="/"
  element={
    <PublicOnlyRoute>
      <Login />
    </PublicOnlyRoute>
  }
/>
<Route
  path="/register"
  element={
    <PublicOnlyRoute>
      <Register />
    </PublicOnlyRoute>
  }
/>
<Route
  path="/cleaner-register"
  element={
    <PublicOnlyRoute>
      <CleanerRegister />
    </PublicOnlyRoute>
  }
/>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cleaner/dashboard"
          element={
            <ProtectedRoute allowedRole="cleaner">
              <CleanerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cleaner/my-jobs"
          element={
            <ProtectedRoute allowedRole="cleaner">
              <CleanerMyJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cleaner/earnings"
          element={
            <ProtectedRoute allowedRole="cleaner">
              <CleanerEarnings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book-service"
          element={
            <ProtectedRoute allowedRole="customer">
              <CustomerBooking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute allowedRole="customer">
              <CustomerMyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

<Route path="/about-us" element={<AboutUs />} />
<Route path="/privacy-policy" element={<PrivacyPolicy />} />
<Route path="/terms-conditions" element={<TermsConditions />} />
      </Routes>
      <Footer />
    </Layout>
  );
}

export default App;