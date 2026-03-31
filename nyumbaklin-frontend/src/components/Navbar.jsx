import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const navStyle = {
    padding: "15px 25px",
    background: "#111827",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  };

  const leftStyle = {
    display: "flex",
    alignItems: "center",
    gap: "25px",
  };

  const brandStyle = {
    margin: 0,
    fontWeight: "bold",
    fontSize: "18px",
    color: "#fff",
  };

  const linkStyle = {
    color: "#d1d5db",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "0.2s",
  };

  const logoutStyle = {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  };

  return (
    <div style={navStyle}>
      <div style={leftStyle}>
        <h3 style={brandStyle}>Nyumbaklin</h3>

        {role === "customer" && (
          <>
            <Link to="/book-service" style={linkStyle}>
              Book Service
            </Link>
            <Link to="/my-bookings" style={linkStyle}>
              My Bookings
            </Link>
          </>
        )}

        {role === "cleaner" && (
          <>
            <Link to="/cleaner/dashboard" style={linkStyle}>
              Dashboard
            </Link>
            <Link to="/cleaner/my-jobs" style={linkStyle}>
              My Jobs
            </Link>
            <Link to="/cleaner/earnings" style={linkStyle}>
              Earnings
            </Link>
          </>
        )}

        {role === "admin" && (
          <>
            <Link to="/dashboard" style={linkStyle}>
              Admin
            </Link>
          </>
        )}
      </div>

      <button onClick={handleLogout} style={logoutStyle}>
        Logout
      </button>
    </div>
  );
}

export default Navbar;