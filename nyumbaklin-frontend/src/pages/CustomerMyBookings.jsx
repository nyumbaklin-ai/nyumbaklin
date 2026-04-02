import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function CustomerMyBookings() {
  const [bookings, setBookings] = useState([]);
  const [ratingInputs, setRatingInputs] = useState({});
  const [submittingRatings, setSubmittingRatings] = useState({});
  const [ratingMessages, setRatingMessages] = useState({});
  const [payingBookingId, setPayingBookingId] = useState(null);
  const [paymentMessages, setPaymentMessages] = useState({});
  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/customers/my-bookings`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();
      const safeData = Array.isArray(data) ? data : [];

      setBookings(safeData);

      setRatingInputs((prev) => {
        const updatedInputs = { ...prev };

        safeData.forEach((b) => {
          if (b.submitted_rating) {
            updatedInputs[b.id] = {
              ...updatedInputs[b.id],
              rating: b.submitted_rating,
              review: b.submitted_review || "",
              submitted: true,
            };
          }
        });

        return updatedInputs;
      });
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

  const handlePay = async (bookingId) => {
    try {
      setPayingBookingId(bookingId);
      setPaymentMessages((prev) => ({
        ...prev,
        [bookingId]: "",
      }));

      const response = await fetch(`${API_URL}/customers/pay/${bookingId}`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Payment failed");
      }

      setPaymentMessages((prev) => ({
        ...prev,
        [bookingId]: "Payment successful.",
      }));

      fetchBookings();
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentMessages((prev) => ({
        ...prev,
        [bookingId]: error.message || "Payment failed",
      }));
    } finally {
      setPayingBookingId(null);
    }
  };

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
    if (status === "pending") return "Your booking is waiting for a cleaner to accept it.";
    if (status === "accepted") return "A cleaner has accepted your booking.";
    if (status === "in progress") return "Your cleaning service is currently in progress.";
    if (status === "completed") return "This cleaning job has been completed successfully.";
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

  const bookingCardStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    marginBottom: "20px",
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

  const locationBoxStyle = {
    marginBottom: "16px",
    padding: "12px",
    borderRadius: "12px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
  };

  const statusTextStyle = {
    color: "#374151",
    fontSize: "14px",
    marginTop: "10px",
    marginBottom: "16px",
  };

  const paymentBoxStyle = {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "12px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
  };

  const paymentButtonStyle = {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
  };

  const paidBadgeStyle = {
    display: "inline-block",
    background: "#dcfce7",
    color: "#166534",
    padding: "8px 14px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "14px",
    marginBottom: "10px",
  };

  const paymentMessageStyle = {
    marginTop: "10px",
    fontSize: "14px",
    color: "#1d4ed8",
    fontWeight: "500",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1>My Bookings</h1>

        <div>
          {bookings.map((b) => {
            const badge = getStatusBadge(b.status);
            const isPaid = b.payment_status === "paid";

            return (
              <div key={b.id} style={bookingCardStyle}>
                <h3>{b.service}</h3>

                <div style={labelStyle}>📅 Date</div>
                <div style={valueStyle}>
                  {new Date(b.booking_date).toLocaleDateString()}
                </div>

                <div style={labelStyle}>💰 Price</div>
                <div style={valueStyle}>
                  UGX {Number(b.price).toLocaleString()}
                </div>

                <div style={locationBoxStyle}>
                  <div style={labelStyle}>📍 Location</div>
                  <div style={valueStyle}>
                    {b.address || "Location not available"}
                  </div>
                </div>

                <div style={labelStyle}>📦 Status</div>
                <div
                  style={{
                    ...badge.style,
                    padding: "10px 14px",
                    borderRadius: "10px",
                    display: "inline-block",
                    fontWeight: "700",
                    marginBottom: "10px",
                  }}
                >
                  {badge.text}
                </div>

                <div style={statusTextStyle}>{getStatusMessage(b.status)}</div>

                <div style={paymentBoxStyle}>
                  <div style={labelStyle}>📱 Mobile Money Payment</div>

                  {isPaid ? (
                    <>
                      <div style={paidBadgeStyle}>Paid</div>

                      <div style={labelStyle}>Payment Method</div>
                      <div style={valueStyle}>
                        {b.payment_method || "mobile_money"}
                      </div>

                      <div style={labelStyle}>Your Total Payment</div>
                      <div style={valueStyle}>
                        UGX {Number(b.price).toLocaleString()}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ color: "#374151", marginBottom: "12px" }}>
                        Pay for this booking using Mobile Money.
                      </div>

                      <button
                        onClick={() => handlePay(b.id)}
                        disabled={payingBookingId === b.id}
                        style={{
                          ...paymentButtonStyle,
                          opacity: payingBookingId === b.id ? 0.7 : 1,
                          cursor:
                            payingBookingId === b.id ? "not-allowed" : "pointer",
                        }}
                      >
                        {payingBookingId === b.id
                          ? "Processing Payment..."
                          : "Pay with Mobile Money"}
                      </button>
                    </>
                  )}

                  {paymentMessages[b.id] && (
                    <div style={paymentMessageStyle}>
                      {paymentMessages[b.id]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CustomerMyBookings;