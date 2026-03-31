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
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginBottom: "20px", textAlign: "center", color: "#1f2937" }}>
          Nyumbaklin Login
        </h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>

        <div style={{ marginTop: "18px", textAlign: "center", color: "#4b5563" }}>
          <p style={{ marginBottom: "10px" }}>
            Don&apos;t have an account?
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
            <Link
              to="/register"
              style={{
                color: "#2563eb",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              Customer Register
            </Link>

            <Link
              to="/cleaner-register"
              style={{
                color: "#16a34a",
                fontWeight: "bold",
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
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginBottom: "20px", textAlign: "center", color: "#1f2937" }}>
          Customer Registration
        </h2>

        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </form>

        <p style={{ marginTop: "18px", textAlign: "center", color: "#4b5563" }}>
          Already have an account?{" "}
          <Link
            to="/"
            style={{
              color: "#2563eb",
              fontWeight: "bold",
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
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginBottom: "20px", textAlign: "center", color: "#1f2937" }}>
          Cleaner Registration
        </h2>

        <form onSubmit={handleCleanerRegister}>
          <input
            type="email"
            placeholder="Cleaner Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Register as Cleaner
          </button>
        </form>

        <p style={{ marginTop: "18px", textAlign: "center", color: "#4b5563" }}>
          Already have an account?{" "}
          <Link
            to="/"
            style={{
              color: "#2563eb",
              fontWeight: "bold",
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

  const cardStyle = {
    borderRadius: "12px",
    padding: "20px",
    background: "white",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  };

  const sectionStyle = {
    background: "white",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
    marginTop: "30px",
    overflowX: "auto",
  };

  const tableHeaderStyle = {
    background: "#f3f4f6",
    color: "#111827",
    fontWeight: "bold",
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
  };

  const tableCellStyle = {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "middle",
  };

  const actionButtonStyle = {
    color: "white",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "13px",
  };

  const inputStyle = {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    minWidth: "220px",
  };

  const selectStyle = {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    minWidth: "180px",
    background: "white",
  };

  return (
    <div
      style={{
        padding: "30px",
        background: "#f4f7fb",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: "25px" }}>
        <h1 style={{ margin: 0, color: "#111827" }}>Admin Dashboard</h1>
        <p style={{ marginTop: "8px", color: "#6b7280" }}>
          Manage users, bookings, pricing, and platform commission for Nyumbaklin.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#374151" }}>Total Users</h3>
          <p style={{ fontSize: "30px", fontWeight: "bold", margin: 0, color: "#111827" }}>
            {stats.totalUsers ?? 0}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#374151" }}>Total Bookings</h3>
          <p style={{ fontSize: "30px", fontWeight: "bold", margin: 0, color: "#111827" }}>
            {stats.totalBookings ?? 0}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#374151" }}>Total Cleaners</h3>
          <p style={{ fontSize: "30px", fontWeight: "bold", margin: 0, color: "#111827" }}>
            {stats.totalCleaners ?? 0}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#374151" }}>Total Customers</h3>
          <p style={{ fontSize: "30px", fontWeight: "bold", margin: 0, color: "#111827" }}>
            {stats.totalCustomers ?? 0}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#374151" }}>
            Completed Job Value
          </h3>
          <p style={{ fontSize: "30px", fontWeight: "bold", margin: 0, color: "#111827" }}>
            UGX {totalCompletedValue.toLocaleString()}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#374151" }}>
            Platform Revenue (15%)
          </h3>
          <p style={{ fontSize: "30px", fontWeight: "bold", margin: 0, color: "#b91c1c" }}>
            UGX {totalPlatformRevenue.toLocaleString()}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#374151" }}>
            Cleaner Payouts
          </h3>
          <p style={{ fontSize: "30px", fontWeight: "bold", margin: 0, color: "#166534" }}>
            UGX {totalCleanerPayout.toLocaleString()}
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
          <h2 style={{ margin: 0, color: "#111827" }}>All Users</h2>

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
                        padding: "6px 10px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: "bold",
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
          <h2 style={{ margin: 0, color: "#111827" }}>All Bookings</h2>

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
                          padding: "6px 10px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: "bold",
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