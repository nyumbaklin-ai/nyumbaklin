import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const navStyle = {
    padding: "16px 28px",
    background: "linear-gradient(90deg, #0f172a, #111827)",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.18)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  };

  const leftStyle = {
    display: "flex",
    alignItems: "center",
    gap: "22px",
    flexWrap: "wrap",
  };

  const brandStyle = {
    margin: 0,
    fontWeight: "800",
    fontSize: "22px",
    color: "#ffffff",
    letterSpacing: "0.3px",
  };

  const getLinkStyle = (path) => ({
    color: location.pathname === path ? "#ffffff" : "#cbd5e1",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: location.pathname === path ? "700" : "600",
    padding: "8px 12px",
    borderRadius: "8px",
    background: location.pathname === path ? "rgba(255,255,255,0.10)" : "transparent",
  });

  const logoutStyle = {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    boxShadow: "0 6px 14px rgba(239, 68, 68, 0.22)",
  };

  return (
    <div style={navStyle}>
      <div style={leftStyle}>
        <h3 style={brandStyle}>Nyumbaklin</h3>

        {role === "customer" && (
          <>
            <Link to="/book-service" style={getLinkStyle("/book-service")}>
              Book Service
            </Link>
            <Link to="/my-bookings" style={getLinkStyle("/my-bookings")}>
              My Bookings
            </Link>
          </>
        )}

        {role === "cleaner" && (
          <>
            <Link to="/cleaner/dashboard" style={getLinkStyle("/cleaner/dashboard")}>
              Dashboard
            </Link>
            <Link to="/cleaner/my-jobs" style={getLinkStyle("/cleaner/my-jobs")}>
              My Jobs
            </Link>
            <Link to="/cleaner/earnings" style={getLinkStyle("/cleaner/earnings")}>
              Earnings
            </Link>
          </>
        )}

        {role === "admin" && (
          <Link to="/dashboard" style={getLinkStyle("/dashboard")}>
            Admin
          </Link>
        )}
      </div>

      <button onClick={handleLogout} style={logoutStyle}>
        Logout
      </button>
    </div>
  );
}

export default Navbar;