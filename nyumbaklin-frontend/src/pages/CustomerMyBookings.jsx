import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function CustomerMyBookings() {
  const [bookings, setBookings] = useState([]);
  const [ratingInputs, setRatingInputs] = useState({});
  const [submittingRatings, setSubmittingRatings] = useState({});
  const [ratingMessages, setRatingMessages] = useState({});
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

  const getStatusMessage = (status) => {
    if (status === "pending") {
      return "Your booking is waiting for a cleaner to accept it.";
    }

    if (status === "accepted") {
      return "A cleaner has accepted your booking. You can now contact them directly.";
    }

    if (status === "in progress") {
      return "Your cleaning service is currently in progress.";
    }

    if (status === "completed") {
      return "This cleaning job has been completed successfully.";
    }

    return "Your booking status has been updated.";
  };

  const formatPhoneForWhatsApp = (phone) => {
    if (!phone) return "";
    return phone.replace(/[^\d]/g, "");
  };

  const handleRatingChange = (bookingId, field, value) => {
    setRatingInputs((prev) => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        [field]: value,
      },
    }));

    setRatingMessages((prev) => ({
      ...prev,
      [bookingId]: "",
    }));
  };

  const submitRating = async (bookingId) => {
    const currentInput = ratingInputs[bookingId] || {};
    const rating = currentInput.rating;
    const review = currentInput.review || "";

    if (!rating) {
      setRatingMessages((prev) => ({
        ...prev,
        [bookingId]: "Please choose a star rating first.",
      }));
      return;
    }

    try {
      setSubmittingRatings((prev) => ({
        ...prev,
        [bookingId]: true,
      }));

      setRatingMessages((prev) => ({
        ...prev,
        [bookingId]: "",
      }));

      const response = await fetch(`${API_URL}/customers/rate-job/${bookingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          rating,
          review,
        }),
      });

      const message = await response.text();

      if (!response.ok) {
        setRatingMessages((prev) => ({
          ...prev,
          [bookingId]: message || "Failed to submit rating.",
        }));
        return;
      }

      setRatingMessages((prev) => ({
        ...prev,
        [bookingId]: "Rating submitted successfully.",
      }));

      setRatingInputs((prev) => ({
        ...prev,
        [bookingId]: {
          rating,
          review,
          submitted: true,
        },
      }));
    } catch (error) {
      console.error("Error submitting rating:", error);
      setRatingMessages((prev) => ({
        ...prev,
        [bookingId]: "Failed to submit rating.",
      }));
    } finally {
      setSubmittingRatings((prev) => ({
        ...prev,
        [bookingId]: false,
      }));
    }
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

  const notificationStyle = {
    marginTop: "-4px",
    marginBottom: "16px",
    padding: "12px",
    borderRadius: "12px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: "14px",
    lineHeight: "1.5",
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
    flexWrap: "wrap",
    marginTop: "12px",
  };

  const actionButtonBaseStyle = {
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    display: "inline-block",
  };

  const ratingBoxStyle = {
    marginTop: "14px",
    padding: "14px",
    borderRadius: "12px",
    background: "#fff7ed",
    border: "1px solid #fdba74",
  };

  const submittedRatingBoxStyle = {
    marginTop: "14px",
    padding: "14px",
    borderRadius: "12px",
    background: "#ecfdf5",
    border: "1px solid #86efac",
  };

  const starsRowStyle = {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "10px",
    marginBottom: "12px",
  };

  const reviewInputStyle = {
    width: "100%",
    minHeight: "90px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    padding: "10px 12px",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    marginTop: "8px",
  };

  const submitRatingButtonStyle = {
    marginTop: "12px",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    background: "#ea580c",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  };

  const getStarButtonStyle = (selected) => ({
    border: selected ? "1px solid #f59e0b" : "1px solid #d1d5db",
    background: selected ? "#fef3c7" : "white",
    color: selected ? "#b45309" : "#374151",
    borderRadius: "10px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: "600",
  });

  const ratingMessageStyle = {
    marginTop: "10px",
    fontSize: "14px",
    color: "#374151",
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
              const hasVisiblePhone =
                (b.status === "accepted" ||
                  b.status === "in progress" ||
                  b.status === "completed") &&
                b.cleaner_phone;

              const whatsappPhone = formatPhoneForWhatsApp(b.cleaner_phone);
              const currentRatingInput = ratingInputs[b.id] || {};
              const selectedRating = currentRatingInput.rating || 0;
              const currentReview = currentRatingInput.review || "";
              const isSubmitting = submittingRatings[b.id];
              const hasSubmittedRating =
                currentRatingInput.submitted === true || !!b.submitted_rating;

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

                  <div style={notificationStyle}>{getStatusMessage(b.status)}</div>

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

                      {hasVisiblePhone && (
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
                      )}
                    </div>
                  )}

                  {b.status === "completed" && !hasSubmittedRating && (
                    <div style={ratingBoxStyle}>
                      <div style={{ ...labelStyle, marginBottom: "6px", color: "#9a3412" }}>
                        Rate this completed job
                      </div>

                      <div style={starsRowStyle}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(b.id, "rating", star)}
                            style={getStarButtonStyle(selectedRating === star)}
                            disabled={isSubmitting}
                          >
                            {star} ★
                          </button>
                        ))}
                      </div>

                      <div style={labelStyle}>Optional review</div>
                      <textarea
                        placeholder="Write a short review..."
                        value={currentReview}
                        onChange={(e) =>
                          handleRatingChange(b.id, "review", e.target.value)
                        }
                        style={reviewInputStyle}
                        disabled={isSubmitting}
                      />

                      <button
                        type="button"
                        onClick={() => submitRating(b.id)}
                        style={{
                          ...submitRatingButtonStyle,
                          opacity: isSubmitting ? 0.7 : 1,
                        }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Rating"}
                      </button>

                      {ratingMessages[b.id] && (
                        <div style={ratingMessageStyle}>{ratingMessages[b.id]}</div>
                      )}
                    </div>
                  )}

                  {b.status === "completed" && hasSubmittedRating && (
                    <div style={submittedRatingBoxStyle}>
                      <div style={{ ...labelStyle, marginBottom: "8px", color: "#166534" }}>
                        You already rated this job
                      </div>

                      <div>
                        <div style={labelStyle}>Submitted Rating</div>
                        <div style={{ ...valueStyle, marginBottom: "10px", color: "#166534" }}>
                          {(currentRatingInput.rating || b.submitted_rating)} / 5
                        </div>
                      </div>

                      <div>
                        <div style={labelStyle}>Submitted Review</div>
                        <div style={{ ...valueStyle, marginBottom: 0, fontWeight: "500" }}>
                          {(currentRatingInput.review &&
                            currentRatingInput.review.trim() !== "") ||
                          (b.submitted_review && b.submitted_review.trim() !== "")
                            ? currentRatingInput.review || b.submitted_review
                            : "No written review submitted."}
                        </div>
                      </div>

                      {ratingMessages[b.id] && (
                        <div style={ratingMessageStyle}>{ratingMessages[b.id]}</div>
                      )}
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