import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function CustomerMyBookings() {
  const [bookings, setBookings] = useState([]);
  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/customers/my-bookings`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const getStatusBadge = (status) => {
    if (status === "pending") {
      return { text: "Pending", style: { background: "#f59e0b", color: "white" } };
    }
    if (status === "accepted") {
      return { text: "Accepted", style: { background: "#2563eb", color: "white" } };
    }
    if (status === "in progress") {
      return { text: "In Progress", style: { background: "#7c3aed", color: "white" } };
    }
    if (status === "completed") {
      return { text: "Completed", style: { background: "#16a34a", color: "white" } };
    }
    return { text: status, style: { background: "#6b7280", color: "white" } };
  };

  const getStatusMessage = (status) => {
    if (status === "pending") {
      return "Your request is waiting for a cleaner to accept.";
    }
    if (status === "accepted") {
      return "A cleaner has accepted your job. You can now contact them.";
    }
    if (status === "in progress") {
      return "Your cleaning service is currently in progress.";
    }
    if (status === "completed") {
      return "This job has been completed successfully.";
    }
    return "";
  };

  const formatPhoneForWhatsApp = (phone) => {
    if (!phone) return "";
    return phone.replace(/[^\d]/g, "");
  };

  const pageStyle = {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "30px 20px",
  };

  const containerStyle = {
    maxWidth: "900px",
    margin: "0 auto",
  };

  const headerCardStyle = {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
    marginBottom: "24px",
  };

  const bookingsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  };

  const bookingCardStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  };

  const labelStyle = {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "4px",
  };

  const valueStyle = {
    color: "#111827",
    fontWeight: "600",
    marginBottom: "14px",
  };

  const badgeBaseStyle = {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "13px",
    marginBottom: "10px",
  };

  const notificationStyle = {
    marginTop: "10px",
    marginBottom: "15px",
    padding: "10px 12px",
    borderRadius: "10px",
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    color: "#334155",
  };

  const phoneBoxStyle = {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "12px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
  };

  const actionButtonsStyle = {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  };

  const actionButtonBaseStyle = {
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    display: "inline-block",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerCardStyle}>
          <h1 style={{ margin: 0 }}>My Bookings</h1>
        </div>

        <div style={bookingsGridStyle}>
          {bookings.map((b) => {
            const badge = getStatusBadge(b.status);
            const whatsappPhone = formatPhoneForWhatsApp(b.cleaner_phone);

            return (
              <div key={b.id} style={bookingCardStyle}>
                <h3>{b.service}</h3>

                <div style={labelStyle}>Booking ID</div>
                <div style={valueStyle}>#{b.id}</div>

                <div style={labelStyle}>Date</div>
                <div style={valueStyle}>
                  {new Date(b.booking_date).toLocaleDateString()}
                </div>

                <div style={labelStyle}>Price</div>
                <div style={valueStyle}>
                  UGX {Number(b.price || 0).toLocaleString()}
                </div>

                <div style={labelStyle}>Status</div>
                <div style={{ ...badgeBaseStyle, ...badge.style }}>
                  {badge.text}
                </div>

                {/* NEW STATUS MESSAGE */}
                <div style={notificationStyle}>
                  {getStatusMessage(b.status)}
                </div>

                {(b.status === "accepted" ||
                  b.status === "in progress" ||
                  b.status === "completed") && (
                  <div style={phoneBoxStyle}>
                    <div style={labelStyle}>Cleaner Phone</div>
                    <div style={{ ...valueStyle, color: "#1d4ed8" }}>
                      {b.cleaner_phone}
                    </div>

                    <div style={actionButtonsStyle}>
                      <a
                        href={`tel:${b.cleaner_phone}`}
                        style={{
                          ...actionButtonBaseStyle,
                          background: "#2563eb",
                          color: "white",
                        }}
                      >
                        Call
                      </a>

                      <a
                        href={`https://wa.me/${whatsappPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          ...actionButtonBaseStyle,
                          background: "#16a34a",
                          color: "white",
                        }}
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CustomerMyBookings;