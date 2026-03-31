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
      return {
        text: "Pending",
        style: {
          background: "#f59e0b",
          color: "white",
        },
      };
    }

    if (status === "accepted") {
      return {
        text: "Accepted",
        style: {
          background: "#2563eb",
          color: "white",
        },
      };
    }

    if (status === "in progress") {
      return {
        text: "In Progress",
        style: {
          background: "#7c3aed",
          color: "white",
        },
      };
    }

    if (status === "completed") {
      return {
        text: "Completed",
        style: {
          background: "#16a34a",
          color: "white",
        },
      };
    }

    return {
      text: status,
      style: {
        background: "#6b7280",
        color: "white",
      },
    };
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
    wordBreak: "break-word",
  };

  const badgeBaseStyle = {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "13px",
    marginBottom: "16px",
  };

  const phoneBoxStyle = {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "12px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerCardStyle}>
          <h1 style={{ margin: 0, color: "#111827" }}>My Bookings</h1>
          <p style={{ marginTop: "8px", color: "#6b7280" }}>
            Track your cleaning bookings and see cleaner contact details after a job is accepted.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "30px",
              textAlign: "center",
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#111827" }}>No bookings yet</h3>
            <p style={{ marginBottom: 0, color: "#6b7280" }}>
              Your booked cleaning services will appear here.
            </p>
          </div>
        ) : (
          <div style={bookingsGridStyle}>
            {bookings.map((b) => {
              const badge = getStatusBadge(b.status);

              return (
                <div key={b.id} style={bookingCardStyle}>
                  <h3 style={{ marginTop: 0, marginBottom: "18px", color: "#111827" }}>
                    {b.service}
                  </h3>

                  <div>
                    <div style={labelStyle}>Booking ID</div>
                    <div style={valueStyle}>#{b.id}</div>
                  </div>

                  <div>
                    <div style={labelStyle}>Date</div>
                    <div style={valueStyle}>
                      {new Date(b.booking_date).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <div style={labelStyle}>Price</div>
                    <div style={valueStyle}>
                      UGX {Number(b.price || 0).toLocaleString()}
                    </div>
                  </div>

                  {b.cleaner && (
                    <div>
                      <div style={labelStyle}>Assigned Cleaner</div>
                      <div style={valueStyle}>{b.cleaner}</div>
                    </div>
                  )}

                  <div>
                    <div style={labelStyle}>Status</div>
                    <div
                      style={{
                        ...badgeBaseStyle,
                        ...badge.style,
                      }}
                    >
                      {badge.text}
                    </div>
                  </div>

                  {(b.status === "accepted" ||
                    b.status === "in progress" ||
                    b.status === "completed") && (
                    <div style={phoneBoxStyle}>
                      <div style={labelStyle}>Cleaner Phone</div>
                      <div
                        style={{
                          ...valueStyle,
                          marginBottom: 0,
                          color: "#1d4ed8",
                        }}
                      >
                        {b.cleaner_phone ? b.cleaner_phone : "Phone not available yet"}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerMyBookings;