import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function CleanerEarnings() {
  const [earnings, setEarnings] = useState(null);
  const [ratingsSummary, setRatingsSummary] = useState(null);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await fetch(`${API_URL}/cleaner/earnings`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const data = await response.json();
        setEarnings(data);
      } catch (error) {
        console.error("Error fetching earnings:", error);
      }
    };

    const fetchRatingsSummary = async () => {
      try {
        const response = await fetch(`${API_URL}/cleaner/ratings-summary`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const data = await response.json();
        setRatingsSummary(data);
      } catch (error) {
        console.error("Error fetching ratings summary:", error);
      }
    };

    const fetchEarningsHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/cleaner/earnings-history`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const data = await response.json();
        setEarningsHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching earnings history:", error);
      }
    };

    fetchEarnings();
    fetchRatingsSummary();
    fetchEarningsHistory();
  }, [token]);

  const pageStyle = {
    minHeight: "100vh",
    background: "#f4f7fb",
    padding: "30px 20px",
  };

  const containerStyle = {
    maxWidth: "1000px",
    margin: "0 auto",
  };

  const headerCardStyle = {
    background: "white",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
    marginBottom: "25px",
  };

  const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  };

  const statCardStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  };

  const labelStyle = {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  };

  const valueStyle = {
    margin: "10px 0 0 0",
    color: "#111827",
    fontSize: "26px",
    fontWeight: "bold",
  };

  const subCardStyle = {
    marginTop: "25px",
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  };

  const reviewCardStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "16px",
    background: "#f8fafc",
    marginTop: "14px",
  };

  const badgeStyle = {
    display: "inline-block",
    background: "#fef3c7",
    color: "#92400e",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerCardStyle}>
          <h1 style={{ margin: 0, color: "#111827" }}>Cleaner Earnings</h1>
          <p style={{ marginTop: "8px", color: "#6b7280" }}>
            View your completed jobs, earnings, payouts, and customer ratings.
          </p>
        </div>

        {!earnings ? (
          <div style={headerCardStyle}>
            <p style={{ margin: 0, color: "#6b7280" }}>
              Loading earnings...
            </p>
          </div>
        ) : (
          <>
            <div style={statsGridStyle}>
              <div style={statCardStyle}>
                <p style={labelStyle}>Completed Jobs</p>
                <h2 style={valueStyle}>{earnings.total_jobs}</h2>
              </div>

              <div style={statCardStyle}>
                <p style={labelStyle}>Total Job Value</p>
                <h2 style={valueStyle}>
                  UGX {Number(earnings.total_value).toLocaleString()}
                </h2>
              </div>

              <div style={statCardStyle}>
                <p style={labelStyle}>Platform Fee (15%)</p>
                <h2 style={valueStyle}>
                  UGX {Number(earnings.platform_fee).toLocaleString()}
                </h2>
              </div>

              <div style={statCardStyle}>
                <p style={labelStyle}>Your Earnings</p>
                <h2 style={valueStyle}>
                  UGX {Number(earnings.cleaner_earnings).toLocaleString()}
                </h2>
              </div>

              <div style={statCardStyle}>
                <p style={labelStyle}>Paid To You</p>
                <h2 style={{ ...valueStyle, color: "green" }}>
                  UGX {Number(earnings.total_paid || 0).toLocaleString()}
                </h2>
              </div>

              <div style={statCardStyle}>
                <p style={labelStyle}>Pending Payout</p>
                <h2 style={{ ...valueStyle, color: "orange" }}>
                  UGX {Number(earnings.total_pending || 0).toLocaleString()}
                </h2>
              </div>

              <div style={statCardStyle}>
                <p style={labelStyle}>Average Rating</p>
                <h2 style={valueStyle}>
                  {ratingsSummary ? ratingsSummary.average_rating : 0} ★
                </h2>
              </div>

              <div style={statCardStyle}>
                <p style={labelStyle}>Total Reviews</p>
                <h2 style={valueStyle}>
                  {ratingsSummary ? ratingsSummary.total_reviews : 0}
                </h2>
              </div>
            </div>

            <div style={subCardStyle}>
              <h2 style={{ marginTop: 0 }}>Commission Breakdown</h2>
              <p style={{ color: "#6b7280" }}>
                Nyumbaklin takes 15% platform fee. The rest is your earning.
              </p>
            </div>

            <div style={subCardStyle}>
              <h2 style={{ marginTop: 0 }}>Earnings History</h2>

              {earningsHistory.length === 0 ? (
                <p style={{ color: "#6b7280" }}>No completed jobs yet.</p>
              ) : (
                earningsHistory.map((job) => (
                  <div key={job.id} style={reviewCardStyle}>
                    <strong>{job.service}</strong>
                    <p>Booking #{job.id}</p>

                    <p>
                      Total Price:{" "}
                      <strong>
                        UGX {Number(job.price || 0).toLocaleString()}
                      </strong>
                    </p>

                    <p>
                      Your Earnings:{" "}
                      <strong style={{ color: "green" }}>
                        UGX {Number(job.cleaner_amount || 0).toLocaleString()}
                      </strong>
                    </p>

                    <p>
                      Payout Status:{" "}
                      <span
                        style={{
                          color:
                            job.cleaner_payout_status === "paid"
                              ? "green"
                              : "orange",
                          fontWeight: "bold",
                        }}
                      >
                        {job.cleaner_payout_status === "paid"
                          ? "Paid"
                          : "Pending"}
                      </span>
                    </p>
                  </div>
                ))
              )}
            </div>

            <div style={subCardStyle}>
              <h2 style={{ marginTop: 0 }}>Customer Reviews</h2>

              {!ratingsSummary ? (
                <p>Loading reviews...</p>
              ) : ratingsSummary.reviews.length === 0 ? (
                <p>No reviews yet.</p>
              ) : (
                ratingsSummary.reviews.map((review) => (
                  <div key={review.id} style={reviewCardStyle}>
                    <strong>{review.customer_email}</strong>
                    <p>Booking #{review.booking_id}</p>
                    <span style={badgeStyle}>{review.rating} ★</span>
                    <p>{review.review || "No review"}</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CleanerEarnings;