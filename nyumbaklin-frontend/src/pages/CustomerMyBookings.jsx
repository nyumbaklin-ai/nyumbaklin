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

      setPaymentMessages((prev) => {
        const updatedMessages = { ...prev };

        safeData.forEach((b) => {
          if (b.payment_status === "paid" && updatedMessages[b.id]) {
            delete updatedMessages[b.id];
          }
        });

        return updatedMessages;
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
        [bookingId]: "Payment request sent. Waiting for OTP confirmation...",
      }));

      const enteredOtp = window.prompt(
        `Enter the OTP sent to your phone.\n\nDemo OTP: ${data?.otpCode || ""}`
      );

      if (!enteredOtp) {
        setPaymentMessages((prev) => ({
          ...prev,
          [bookingId]: "OTP confirmation was cancelled.",
        }));
        return;
      }

      const confirmResponse = await fetch(
        `${API_URL}/customers/confirm-payment/${bookingId}`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ otp: enteredOtp }),
        }
      );

      const confirmData = await confirmResponse.json().catch(() => null);

      if (!confirmResponse.ok) {
        throw new Error(confirmData?.message || "OTP confirmation failed");
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
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
    padding: "30px 20px",
  };

  const containerStyle = {
    maxWidth: "950px",
    margin: "0 auto",
  };

  const pageHeaderStyle = {
    background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
    color: "white",
    padding: "24px",
    borderRadius: "18px",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.18)",
    marginBottom: "24px",
  };

  const bookingCardStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
    marginBottom: "20px",
  };

  const cardTopRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "16px",
  };

  const serviceTitleStyle = {
    margin: 0,
    color: "#0f172a",
    fontSize: "24px",
  };

  const badgeStyle = {
    padding: "10px 14px",
    borderRadius: "999px",
    display: "inline-block",
    fontWeight: "700",
    fontSize: "14px",
  };

  const detailsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  };

  const detailCardStyle = {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "14px",
  };

  const labelStyle = {
    color: "#6b7280",
    fontSize: "13px",
    marginBottom: "6px",
    fontWeight: "500",
  };

  const valueStyle = {
    color: "#111827",
    fontWeight: "700",
    fontSize: "16px",
  };

  const locationBoxStyle = {
    marginBottom: "16px",
    padding: "14px",
    borderRadius: "14px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
  };

  const statusTextStyle = {
    color: "#374151",
    fontSize: "14px",
    marginTop: "8px",
    marginBottom: "16px",
    lineHeight: "1.5",
  };

  const paymentBoxStyle = {
    marginTop: "16px",
    padding: "18px",
    borderRadius: "14px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
  };

  const paymentButtonStyle = {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
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

  const unpaidBadgeStyle = {
    display: "inline-block",
    background: "#fee2e2",
    color: "#b91c1c",
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
    fontWeight: "600",
  };

  const emptyStateStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "30px",
    textAlign: "center",
    color: "#64748b",
    boxShadow: "0 8px 22px rgba(0,0,0,0.05)",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={pageHeaderStyle}>
          <h1 style={{ margin: 0, fontSize: "32px" }}>My Bookings</h1>
          <p style={{ margin: "10px 0 0 0", opacity: 0.9 }}>
            Track your cleaning bookings, payment status, and service progress.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div style={emptyStateStyle}>
            <h2 style={{ marginTop: 0, color: "#0f172a" }}>No bookings yet</h2>
            <p style={{ marginBottom: 0 }}>
              Your booked services will appear here once you make a booking.
            </p>
          </div>
        ) : (
          <div>
            {bookings.map((b) => {
              const badge = getStatusBadge(b.status);
              const isPaid = b.payment_status === "paid";
              const cleanerPhone = b.cleaner_phone || "";
              const whatsappPhone = formatPhoneForWhatsApp(cleanerPhone);

              return (
                <div key={b.id} style={bookingCardStyle}>
                  <div style={cardTopRowStyle}>
                    <div>
                      <h3 style={serviceTitleStyle}>{b.service}</h3>
                      <p style={{ margin: "6px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
                        Booking #{b.id}
                      </p>
                    </div>

                    <div
                      style={{
                        ...badgeStyle,
                        ...badge.style,
                      }}
                    >
                      {badge.text}
                    </div>
                  </div>

                  <div style={detailsGridStyle}>
                    <div style={detailCardStyle}>
                      <div style={labelStyle}>📅 Date</div>
                      <div style={valueStyle}>
                        {new Date(b.booking_date).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={detailCardStyle}>
                      <div style={labelStyle}>💰 Price</div>
                      <div style={valueStyle}>
                        UGX {Number(b.price).toLocaleString()}
                      </div>
                    </div>

                    <div style={detailCardStyle}>
                      <div style={labelStyle}>📱 Payment Status</div>
                      <div style={valueStyle}>
                        {isPaid ? "Paid" : b.payment_status || "Unpaid"}
                      </div>
                    </div>
                  </div>

                  <div style={locationBoxStyle}>
                    <div style={labelStyle}>📍 Location</div>
                    <div style={valueStyle}>
                      {b.address || "Location not available"}
                    </div>
                  </div>

                  <div style={statusTextStyle}>{getStatusMessage(b.status)}</div>

                  {(b.cleaner || cleanerPhone) && (
                    <div
                      style={{
                        marginBottom: "16px",
                        padding: "14px",
                        borderRadius: "14px",
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div style={labelStyle}>🧹 Assigned Cleaner</div>
                      <div style={{ ...valueStyle, marginBottom: "10px" }}>
                        {b.cleaner || "Cleaner assigned"}
                      </div>

                      {cleanerPhone && (
                        <>
                          <div style={labelStyle}>📞 Cleaner Phone</div>
                          <div style={{ ...valueStyle, marginBottom: "12px" }}>
                            {cleanerPhone}
                          </div>

                          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <a
                              href={`tel:${cleanerPhone}`}
                              style={{
                                background: "#16a34a",
                                color: "white",
                                textDecoration: "none",
                                padding: "10px 14px",
                                borderRadius: "10px",
                                fontWeight: "700",
                                fontSize: "14px",
                              }}
                            >
                              Call Cleaner
                            </a>

                            {whatsappPhone && (
                              <a
                                href={`https://wa.me/${whatsappPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  background: "#2563eb",
                                  color: "white",
                                  textDecoration: "none",
                                  padding: "10px 14px",
                                  borderRadius: "10px",
                                  fontWeight: "700",
                                  fontSize: "14px",
                                }}
                              >
                                WhatsApp Cleaner
                              </a>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div style={paymentBoxStyle}>
                    <div style={labelStyle}>📱 Mobile Money Payment</div>

                    {isPaid ? (
                      <>
                        <div style={paidBadgeStyle}>Payment Successful</div>

                        <div style={detailsGridStyle}>
                          <div style={detailCardStyle}>
                            <div style={labelStyle}>Payment Method</div>
                            <div style={valueStyle}>
                              {b.payment_method || "mobile_money"}
                            </div>
                          </div>

                          <div style={detailCardStyle}>
                            <div style={labelStyle}>Total Paid</div>
                            <div style={valueStyle}>
                              UGX {Number(b.price).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={unpaidBadgeStyle}>Payment Pending</div>

                        <div style={{ color: "#374151", marginBottom: "12px", lineHeight: "1.5" }}>
                          Pay for this booking using Mobile Money to confirm your service payment.
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

                        {!isPaid && paymentMessages[b.id] && (
                          <div style={paymentMessageStyle}>
                            {paymentMessages[b.id]}
                          </div>
                        )}
                      </>
                    )}
                  </div>
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