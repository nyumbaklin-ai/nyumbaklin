import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation, Link } from "react-router-dom";

import Navbar from "./components/Navbar";
import CleanerDashboard from "./pages/CleanerDashboard";
import CleanerMyJobs from "./pages/CleanerMyJobs";
import CleanerEarnings from "./pages/CleanerEarnings";
import CustomerBooking from "./pages/CustomerBooking";
import CustomerMyBookings from "./pages/CustomerMyBookings";

const API_URL = import.meta.env.VITE_API_URL;
console.log("API_URL:", API_URL);

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
        body: JSON.stringify({ email, password }),
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
        body: JSON.stringify({ email, password }),
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

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
}

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");

  const token = localStorage.getItem("token");

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

  useEffect(() => {
    fetchUsers();
    fetchBookings();
    fetchStats();
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

      const message = await response.text();
      alert(message);

      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

  const changeUserRole = async (id, currentRole) => {
    const newRole = window.prompt(
      "Enter new role for this user (admin, cleaner, customer):",
      currentRole
    );

    if (newRole === null) {
      return;
    }

    const cleanedRole = newRole.trim().toLowerCase();

    if (
      cleanedRole !== "admin" &&
      cleanedRole !== "cleaner" &&
      cleanedRole !== "customer"
    ) {
      alert("Please enter a valid role: admin, cleaner, or customer");
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

      const message = await response.text();
      alert(message);

      fetchUsers();
      fetchStats();
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

      const message = await response.text();
      alert(message);

      fetchBookings();
      fetchStats();
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

      const message = await response.text();
      alert(message);

      fetchBookings();
      fetchStats();
    } catch (error) {
      console.error("Error updating price:", error);
      alert("Error updating price");
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

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email
      .toLowerCase()
      .includes(userSearch.toLowerCase());

    const matchesRole =
      userRoleFilter === "all" || user.role === userRoleFilter;

    return matchesSearch && matchesRole;
  });

  const filteredBookings = bookings.filter((booking) => {
    const emailText = booking.email ? booking.email.toLowerCase() : "";
    const serviceText = booking.service ? booking.service.toLowerCase() : "";

    const matchesSearch =
      emailText.includes(bookingSearch.toLowerCase()) ||
      serviceText.includes(bookingSearch.toLowerCase());

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

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: 0, color: "#0f172a", fontSize: "34px" }}>Admin Dashboard</h1>
        <p style={{ marginTop: "10px", color: "#64748b", fontSize: "15px" }}>
          Manage users, bookings, pricing, and platform commission for Nyumbaklin.
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
              placeholder="Search by email"
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

        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px" }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>ID</th>
              <th style={tableHeaderStyle}>Email</th>
              <th style={tableHeaderStyle}>Role</th>
              <th style={tableHeaderStyle}>Change Role</th>
              <th style={tableHeaderStyle}>Delete</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td style={tableCellStyle} colSpan="5">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} style={{ background: "#fff" }}>
                  <td style={tableCellStyle}>{user.id}</td>
                  <td style={tableCellStyle}>{user.email}</td>
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
              placeholder="Search by email or service"
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

        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1400px" }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>ID</th>
              <th style={tableHeaderStyle}>Email</th>
              <th style={tableHeaderStyle}>Service</th>
              <th style={tableHeaderStyle}>Status</th>
              <th style={tableHeaderStyle}>Cleaner</th>
              <th style={tableHeaderStyle}>Price</th>
              <th style={tableHeaderStyle}>Platform Fee</th>
              <th style={tableHeaderStyle}>Cleaner Payout</th>
              <th style={tableHeaderStyle}>Date</th>
              <th style={tableHeaderStyle}>Update Price</th>
              <th style={tableHeaderStyle}>Delete</th>
            </tr>
          </thead>

          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td style={tableCellStyle} colSpan="11">
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

                return (
                  <tr key={booking.id} style={{ background: "#fff" }}>
                    <td style={tableCellStyle}>{booking.id}</td>
                    <td style={tableCellStyle}>{booking.email}</td>
                    <td style={tableCellStyle}>{booking.service}</td>
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
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </td>
                    <td style={tableCellStyle}>
                      <button
                        onClick={() => updatePrice(booking.id, booking.price)}
                        style={{
                          ...actionButtonStyle,
                          background: "#16a34a",
                        }}
                      >
                        Update Price
                      </button>
                    </td>
                    <td style={tableCellStyle}>
                      <button
                        onClick={() => deleteBooking(booking.id)}
                        style={{
                          ...actionButtonStyle,
                          background: "#dc2626",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
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
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cleaner-register" element={<CleanerRegister />} />

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
      </Routes>
    </Layout>
  );
}

export default App;