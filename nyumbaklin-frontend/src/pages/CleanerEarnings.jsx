import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function CleanerEarnings() {
  const [earnings, setEarnings] = useState(null);
  const [ratingsSummary, setRatingsSummary] = useState(null);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const token = localStorage.getItem("token");

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

  const fetchAllCleanerData = async () => {
    await Promise.all([
      fetchEarnings(),
      fetchRatingsSummary(),
      fetchEarningsHistory(),
    ]);
  };

  useEffect(() => {
    fetchAllCleanerData();
  }, [token]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllCleanerData();
    setRefreshing(false);
  };

  const paidJobsCount = earningsHistory.filter(
    (job) => job.cleaner_payout_status === "paid"
  ).length;

  const pendingJobsCount = earningsHistory.filter(
    (job) => job.cleaner_payout_status !== "paid"
  ).length;

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

  const refreshButtonStyle = {
    background: refreshing ? "#94a3b8" : "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: refreshing ? "not-allowed" : "pointer",
    marginTop: "16px",
  };

  const historySummaryStyle = {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "12px",
    marginBottom: "10px",
  };

  const summaryPillStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
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

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={refreshButtonStyle}
          >
            {refreshing ? "Refreshing..." : "Refresh Earnings"}
          </button>
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
                  {ratingsSummary?.average_rating || 0} ★
                </h2>
              </div>

              <div style={statCardStyle}>
                <p style={labelStyle}>Total Reviews</p>
                <h2 style={valueStyle}>
                  {ratingsSummary?.total_reviews || 0}
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
              <p style={{ color: "#6b7280", marginTop: "8px" }}>
                Track each completed job and confirm whether your payout has
                already been sent or is still pending.
              </p>

              <div style={historySummaryStyle}>
                <span
                  style={{
                    ...summaryPillStyle,
                    background: "#dcfce7",
                    color: "#166534",
                  }}
                >
                  Paid Jobs: {paidJobsCount}
                </span>

                <span
                  style={{
                    ...summaryPillStyle,
                    background: "#ffedd5",
                    color: "#c2410c",
                  }}
                >
                  Pending Jobs: {pendingJobsCount}
                </span>
              </div>

              {earningsHistory.length === 0 ? (
                <p style={{ color: "#6b7280" }}>No completed jobs yet.</p>
              ) : (
                earningsHistory.map((job) => {
                  const isPaid = job.cleaner_payout_status === "paid";

                  return (
                    <div
                      key={job.id}
                      style={{
                        ...reviewCardStyle,
                        background: isPaid ? "#f0fdf4" : "#fff7ed",
                        border: isPaid
                          ? "1px solid #bbf7d0"
                          : "1px solid #fed7aa",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <strong style={{ color: "#111827", fontSize: "16px" }}>
                            {job.service}
                          </strong>
                          <p style={{ margin: "8px 0 0 0", color: "#475569" }}>
                            Booking #{job.id}
                          </p>
                        </div>

                        <span
                          style={{
                            display: "inline-block",
                            padding: "7px 14px",
                            borderRadius: "999px",
                            fontSize: "13px",
                            fontWeight: "700",
                            background: isPaid ? "#dcfce7" : "#ffedd5",
                            color: isPaid ? "#166534" : "#c2410c",
                          }}
                        >
                          {isPaid ? "Paid" : "Pending"}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(180px, 1fr))",
                          gap: "14px",
                          marginTop: "16px",
                        }}
                      >
                        <div>
                          <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
                            Total Price
                          </p>
                          <p
                            style={{
                              margin: "6px 0 0 0",
                              fontWeight: "700",
                              color: "#111827",
                            }}
                          >
                            UGX {Number(job.price || 0).toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
                            Your Earnings
                          </p>
                          <p
                            style={{
                              margin: "6px 0 0 0",
                              fontWeight: "700",
                              color: "#16a34a",
                            }}
                          >
                            UGX {Number(job.cleaner_amount || 0).toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
                            Payout Status
                          </p>
                          <p
                            style={{
                              margin: "6px 0 0 0",
                              fontWeight: "700",
                              color: isPaid ? "#166534" : "#c2410c",
                            }}
                          >
                            {isPaid ? "Paid" : "Pending"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={subCardStyle}>
              <h2 style={{ marginTop: 0 }}>Customer Reviews</h2>

              {!ratingsSummary ? (
                <p>Loading reviews...</p>
              ) : !ratingsSummary.reviews || ratingsSummary.reviews.length === 0 ? (
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