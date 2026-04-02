import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function CustomerMyBookings() {
  const [bookings, setBookings] = useState([]);
  const [payingBookingId, setPayingBookingId] = useState(null);
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
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const handlePay = async (bookingId) => {
    try {
      setPayingBookingId(bookingId);

      await fetch(`${API_URL}/customers/pay/${bookingId}`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      fetchBookings(); // refresh after payment
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed");
    } finally {
      setPayingBookingId(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "pending") return { text: "Pending", color: "#f59e0b" };
    if (status === "accepted") return { text: "Accepted", color: "#2563eb" };
    if (status === "in progress") return { text: "In Progress", color: "#7c3aed" };
    if (status === "completed") return { text: "Completed", color: "#16a34a" };
    return { text: status, color: "#6b7280" };
  };

  return (
    <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "900px", margin: "auto" }}>
        <h1>My Bookings</h1>

        {bookings.map((b) => {
          const badge = getStatusBadge(b.status);
          const isPaid = b.payment_status === "paid";

          return (
            <div
              key={b.id}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "16px",
                marginBottom: "20px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              }}
            >
              <h3>{b.service}</h3>

              <p>📅 {new Date(b.booking_date).toLocaleDateString()}</p>
              <p>💰 UGX {Number(b.price).toLocaleString()}</p>
              <p>📍 {b.address}</p>

              <div
                style={{
                  background: badge.color,
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  display: "inline-block",
                  marginBottom: "10px",
                }}
              >
                {badge.text}
              </div>

              {/* PAYMENT SECTION */}
              <div
                style={{
                  marginTop: "15px",
                  padding: "15px",
                  background: "#eff6ff",
                  borderRadius: "10px",
                }}
              >
                <h4>📱 Mobile Money Payment</h4>

                {isPaid ? (
                  <>
                    <div
                      style={{
                        background: "#dcfce7",
                        color: "#166534",
                        padding: "8px 12px",
                        borderRadius: "999px",
                        display: "inline-block",
                        fontWeight: "bold",
                        marginBottom: "10px",
                      }}
                    >
                      Paid
                    </div>

                    <p>Payment Method: Mobile Money</p>
                    <p>Total Paid: UGX {Number(b.price).toLocaleString()}</p>
                  </>
                ) : (
                  <>
                    <p>Pay for this booking using Mobile Money</p>

                    <button
                      onClick={() => handlePay(b.id)}
                      disabled={payingBookingId === b.id}
                      style={{
                        background: "#16a34a",
                        color: "white",
                        padding: "10px 16px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      {payingBookingId === b.id
                        ? "Processing..."
                        : "Pay with Mobile Money"}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CustomerMyBookings;