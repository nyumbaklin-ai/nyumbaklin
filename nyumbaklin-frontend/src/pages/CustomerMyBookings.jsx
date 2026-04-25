import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const NYUMBAKLIN_MTN_PAYMENT_NUMBER = "Mtn Number:0781812743";
const NYUMBAKLIN_AIRTEL_PAYMENT_NUMBER = "Airtel Merchant Code:7076122";

function CustomerMyBookings() {
  const [bookings, setBookings] = useState([]);
  const [ratingInputs, setRatingInputs] = useState({});
  const [submittingRatings, setSubmittingRatings] = useState({});
  const [ratingMessages, setRatingMessages] = useState({});
  const [submittingPaymentId, setSubmittingPaymentId] = useState(null);
  const [paymentInputs, setPaymentInputs] = useState({});
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

      setPaymentInputs((prev) => {
        const updatedInputs = { ...prev };

        safeData.forEach((b) => {
          if (!updatedInputs[b.id]) {
            updatedInputs[b.id] = {
              payment_network: b.manual_payment_network || "mtn",
              payment_phone: b.manual_payment_phone || "",
              transaction_reference: b.manual_payment_reference || "",
              payment_note: b.manual_payment_note || "",
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

  const handlePaymentInputChange = (bookingId, field, value) => {
    setPaymentInputs((prev) => ({
      ...prev,
      [bookingId]: {
        payment_network: "mtn",
        payment_phone: "",
        transaction_reference: "",
        payment_note: "",
        ...(prev[bookingId] || {}),
        [field]: value,
      },
    }));
  };

  const handleSubmitManualPayment = async (bookingId) => {
    const currentInput = paymentInputs[bookingId] || {};
    const paymentNetwork = currentInput.payment_network || "mtn";
    const paymentPhone = String(currentInput.payment_phone || "").trim();
    const transactionReference = String(
      currentInput.transaction_reference || ""
    ).trim();
    const paymentNote = String(currentInput.payment_note || "").trim();

    if (!paymentPhone) {
      setPaymentMessages((prev) => ({
        ...prev,
        [bookingId]: "Please enter the phone number you used to pay.",
      }));
      return;
    }

    if (!transactionReference) {
      setPaymentMessages((prev) => ({
        ...prev,
        [bookingId]: "Please enter the Mobile Money transaction reference.",
      }));
      return;
    }

    try {
      setSubmittingPaymentId(bookingId);
      setPaymentMessages((prev) => ({
        ...prev,
        [bookingId]: "",
      }));

      const response = await fetch(
        `${API_URL}/customers/submit-manual-payment/${bookingId}`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_network: paymentNetwork,
            payment_phone: paymentPhone,
            transaction_reference: transactionReference,
            payment_note: paymentNote,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Payment proof submission failed");
      }

      setPaymentMessages((prev) => ({
        ...prev,
        [bookingId]:
          data?.message ||
          "Payment proof submitted successfully. Admin will verify it soon.",
      }));

      fetchBookings();
    } catch (error) {
      console.error("Manual payment submission error:", error);
      setPaymentMessages((prev) => ({
        ...prev,
        [bookingId]: error.message || "Payment proof submission failed",
      }));
    } finally {
      setSubmittingPaymentId(null);
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

  const getPaymentStatusText = (paymentStatus) => {
    if (paymentStatus === "paid") return "Paid";
    if (paymentStatus === "pending_verification") return "Pending Verification";
    if (paymentStatus === "rejected") return "Rejected";
    return "Unpaid";
  };

  const getPaymentStatusStyle = (paymentStatus) => {
    if (paymentStatus === "paid") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (paymentStatus === "pending_verification") {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    if (paymentStatus === "rejected") {
      return {
        background: "#fee2e2",
        color: "#b91c1c",
      };
    }

    return {
      background: "#fee2e2",
      color: "#b91c1c",
    };
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

  const parseGpsAddress = (address) => {
    if (!address || typeof address !== "string") return null;

    const match = address.match(
      /^GPS:\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)(?:\s*\(Accuracy:\s*(\d+)m\))?$/i
    );

    if (!match) return null;

    return {
      latitude: match[1],
      longitude: match[2],
      accuracy: match[3] || "",
    };
  };

  const getGoogleMapsLink = (latitude, longitude) => {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
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

  const gpsLocationBoxStyle = {
    marginBottom: "16px",
    padding: "14px",
    borderRadius: "14px",
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
  };

  const gpsBadgeStyle = {
    display: "inline-block",
    background: "#cffafe",
    color: "#155e75",
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "13px",
    marginBottom: "12px",
  };

  const gpsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginTop: "8px",
  };

  const gpsCardStyle = {
    background: "white",
    border: "1px solid #bae6fd",
    borderRadius: "12px",
    padding: "12px",
  };

  const gpsSubTextStyle = {
    marginTop: "10px",
    color: "#155e75",
    fontSize: "14px",
    lineHeight: "1.6",
    wordBreak: "break-word",
  };

  const mapLinkStyle = {
    display: "inline-block",
    marginTop: "12px",
    background: "#0f766e",
    color: "white",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "14px",
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

  const paymentStatusBadgeStyle = {
    display: "inline-block",
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

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  const selectStyle = {
    ...inputStyle,
    background: "white",
  };

  const instructionsBoxStyle = {
    background: "white",
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "14px",
    color: "#1e3a8a",
    lineHeight: "1.6",
    fontSize: "14px",
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
              const isPendingVerification =
                b.payment_status === "pending_verification";
              const isRejected = b.payment_status === "rejected";
              const cleanerPhone = b.cleaner_phone || "";
              const whatsappPhone = formatPhoneForWhatsApp(cleanerPhone);
              const gpsLocation = parseGpsAddress(b.address);
              const currentPaymentInput = paymentInputs[b.id] || {
                payment_network: b.manual_payment_network || "mtn",
                payment_phone: b.manual_payment_phone || "",
                transaction_reference: b.manual_payment_reference || "",
                payment_note: b.manual_payment_note || "",
              };

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
                        {getPaymentStatusText(b.payment_status)}
                      </div>
                    </div>
                  </div>

                  {gpsLocation ? (
                    <div style={gpsLocationBoxStyle}>
                      <div style={labelStyle}>📍 Location</div>
                      <div style={gpsBadgeStyle}>GPS Location</div>

                      <div style={gpsGridStyle}>
                        <div style={gpsCardStyle}>
                          <div style={labelStyle}>Latitude</div>
                          <div style={valueStyle}>{gpsLocation.latitude}</div>
                        </div>

                        <div style={gpsCardStyle}>
                          <div style={labelStyle}>Longitude</div>
                          <div style={valueStyle}>{gpsLocation.longitude}</div>
                        </div>

                        {gpsLocation.accuracy && (
                          <div style={gpsCardStyle}>
                            <div style={labelStyle}>Accuracy</div>
                            <div style={valueStyle}>{gpsLocation.accuracy} meters</div>
                          </div>
                        )}

                        {b.gps_readable_location && (
                          <div style={gpsCardStyle}>
                            <div style={labelStyle}>Approx Area</div>
                            <div style={valueStyle}>{b.gps_readable_location}</div>
                          </div>
                        )}
                      </div>

                      <div style={gpsSubTextStyle}>
                        This location was captured from your device GPS.
                      </div>

                      <a
                        href={getGoogleMapsLink(gpsLocation.latitude, gpsLocation.longitude)}
                        target="_blank"
                        rel="noreferrer"
                        style={mapLinkStyle}
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  ) : (
                    <div style={locationBoxStyle}>
                      <div style={labelStyle}>📍 Location</div>
                      <div style={{ ...valueStyle, wordBreak: "break-word" }}>
                        {b.address || "Location not available"}
                      </div>
                    </div>
                  )}

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
                    <div style={labelStyle}>📱 Manual Mobile Money Payment</div>

                    <div
                      style={{
                        ...paymentStatusBadgeStyle,
                        ...getPaymentStatusStyle(b.payment_status),
                      }}
                    >
                      {getPaymentStatusText(b.payment_status)}
                    </div>

                    {isPaid ? (
                      <>
                        <div style={detailsGridStyle}>
                          <div style={detailCardStyle}>
                            <div style={labelStyle}>Payment Method</div>
                            <div style={valueStyle}>
                              {b.payment_method || "manual_mobile_money"}
                            </div>
                          </div>

                          <div style={detailCardStyle}>
                            <div style={labelStyle}>Total Paid</div>
                            <div style={valueStyle}>
                              UGX {Number(b.price).toLocaleString()}
                            </div>
                          </div>

                          {b.manual_payment_reference && (
                            <div style={detailCardStyle}>
                              <div style={labelStyle}>Transaction Reference</div>
                              <div style={valueStyle}>
                                {b.manual_payment_reference}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={instructionsBoxStyle}>
                          <strong>How to pay:</strong>
                          <br />
                          1. Send{" "}
                          <strong>UGX {Number(b.price).toLocaleString()}</strong>{" "}
                          using MTN or Airtel Mobile Money.
                          <br />
                          2. Use your booking number as reference:{" "}
                          <strong>Booking #{b.id}</strong>
                          <br />
                          3. After paying, enter your phone number and transaction
                          reference below.
                          <br />
                          <br />
                          <strong>MTN Payment Number:</strong>{" "}
                          {NYUMBAKLIN_MTN_PAYMENT_NUMBER}
                          <br />
                          <strong>Airtel Payment Number:</strong>{" "}
                          {NYUMBAKLIN_AIRTEL_PAYMENT_NUMBER}
                        </div>

                        {isPendingVerification && (
                          <div
                            style={{
                              background: "#fef3c7",
                              color: "#92400e",
                              padding: "12px",
                              borderRadius: "10px",
                              marginBottom: "12px",
                              fontWeight: "700",
                            }}
                          >
                            Your payment proof has been submitted. Admin will verify
                            it soon.
                          </div>
                        )}

                        {isRejected && (
                          <div
                            style={{
                              background: "#fee2e2",
                              color: "#b91c1c",
                              padding: "12px",
                              borderRadius: "10px",
                              marginBottom: "12px",
                              fontWeight: "700",
                            }}
                          >
                            Your payment proof was rejected. Please check the
                            transaction reference and submit again.
                          </div>
                        )}

                        {b.manual_payment_reference && !isRejected && (
                          <div style={detailsGridStyle}>
                            <div style={detailCardStyle}>
                              <div style={labelStyle}>Submitted Network</div>
                              <div style={valueStyle}>
                                {b.manual_payment_network?.toUpperCase() || "N/A"}
                              </div>
                            </div>

                            <div style={detailCardStyle}>
                              <div style={labelStyle}>Submitted Phone</div>
                              <div style={valueStyle}>
                                {b.manual_payment_phone || "N/A"}
                              </div>
                            </div>

                            <div style={detailCardStyle}>
                              <div style={labelStyle}>Submitted Reference</div>
                              <div style={valueStyle}>
                                {b.manual_payment_reference || "N/A"}
                              </div>
                            </div>
                          </div>
                        )}

                        {!isPendingVerification && (
                          <div style={{ display: "grid", gap: "12px" }}>
                            <div>
                              <div style={labelStyle}>Payment Network</div>
                              <select
                                value={currentPaymentInput.payment_network}
                                onChange={(e) =>
                                  handlePaymentInputChange(
                                    b.id,
                                    "payment_network",
                                    e.target.value
                                  )
                                }
                                style={selectStyle}
                              >
                                <option value="mtn">MTN Mobile Money</option>
                                <option value="airtel">Airtel Money</option>
                              </select>
                            </div>

                            <div>
                              <div style={labelStyle}>Phone Number Used to Pay</div>
                              <input
                                type="tel"
                                placeholder="Example: 077XXXXXXX"
                                value={currentPaymentInput.payment_phone}
                                onChange={(e) =>
                                  handlePaymentInputChange(
                                    b.id,
                                    "payment_phone",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                              />
                            </div>

                            <div>
                              <div style={labelStyle}>Transaction Reference / ID</div>
                              <input
                                type="text"
                                placeholder="Enter transaction ID from Mobile Money SMS"
                                value={currentPaymentInput.transaction_reference}
                                onChange={(e) =>
                                  handlePaymentInputChange(
                                    b.id,
                                    "transaction_reference",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                              />
                            </div>

                            <div>
                              <div style={labelStyle}>Optional Note</div>
                              <input
                                type="text"
                                placeholder="Example: Paid from my wife's phone"
                                value={currentPaymentInput.payment_note}
                                onChange={(e) =>
                                  handlePaymentInputChange(
                                    b.id,
                                    "payment_note",
                                    e.target.value
                                  )
                                }
                                style={inputStyle}
                              />
                            </div>

                            <button
                              onClick={() => handleSubmitManualPayment(b.id)}
                              disabled={submittingPaymentId === b.id}
                              style={{
                                ...paymentButtonStyle,
                                opacity: submittingPaymentId === b.id ? 0.7 : 1,
                                cursor:
                                  submittingPaymentId === b.id
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                            >
                              {submittingPaymentId === b.id
                                ? "Submitting Proof..."
                                : "Submit Payment Proof"}
                            </button>
                          </div>
                        )}

                        {paymentMessages[b.id] && (
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