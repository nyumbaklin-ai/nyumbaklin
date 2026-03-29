import { Link, useNavigate } from "react-router-dom";

function Navbar() {

  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div style={{
      padding:"15px",
      background:"black",
      color:"white",
      display:"flex",
      gap:"20px",
      justifyContent:"space-between"
    }}>

      <div style={{display:"flex", gap:"20px"}}>

        <h3>Nyumbaklin</h3>

        {role === "customer" && (
          <>
            <Link to="/book-service" style={{color:"white"}}>Book Service</Link>
            <Link to="/my-bookings" style={{color:"white"}}>My Bookings</Link>
          </>
        )}

        {role === "cleaner" && (
          <>
            <Link to="/cleaner/dashboard" style={{color:"white"}}>Dashboard</Link>
            <Link to="/cleaner/my-jobs" style={{color:"white"}}>My Jobs</Link>
          </>
        )}

        {role === "admin" && (
          <>
            <Link to="/dashboard" style={{color:"white"}}>Admin</Link>
          </>
        )}

      </div>

      {/* ✅ LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        style={{
          background:"red",
          color:"white",
          border:"none",
          padding:"5px 10px",
          cursor:"pointer"
        }}
      >
        Logout
      </button>

    </div>
  );
}

export default Navbar;