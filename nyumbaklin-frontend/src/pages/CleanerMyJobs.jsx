import { useEffect, useState } from "react";

function CleanerMyJobs() {
  const [jobs, setJobs] = useState([]);
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/cleaner/my-cleaner-jobs`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to fetch jobs");
        setJobs([]);
        return;
      }

      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch jobs error:", err);
      alert("Failed to connect to backend");
      setJobs([]);
    }
  };

  useEffect(() => {
    fetchJobs();

    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const startJob = async (id) => {
    try {
      const response = await fetch(`${API_URL}/cleaner/start-job/${id}`, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const message = await response.text();
      alert(message);
      fetchJobs();
    } catch (error) {
      console.error(error);
      alert("Failed to start job");
    }
  };

  const completeJob = async (id) => {
    try {
      const response = await fetch(`${API_URL}/cleaner/complete-job/${id}`, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const message = await response.text();
      alert(message);
      fetchJobs();
    } catch (error) {
      console.error(error);
      alert("Failed to complete job");
    }
  };

  const totalCompleted = jobs.filter((job) => job.status === "completed").length;
  const totalInProgress = jobs.filter((job) => job.status === "in progress").length;
  const totalAccepted = jobs.filter((job) => job.status === "accepted").length;

  const getStatusBadge = (status) => {
    if (status === "accepted") {
      return {
        text: "Accepted",
        style: {
          background: "#dbeafe",
          color: "#1d4ed8",
        },
      };
    }

    if (status === "in progress") {
      return {
        text: "In Progress",
        style: {
          background: "#fef3c7",
          color: "#b45309",
        },
      };
    }

    if (status === "completed") {
      return {
        text: "Completed",
        style: {
          background: "#dcfce7",
          color: "#15803d",
        },
      };
    }

    return {
      text: status,
      style: {
        background: "#e5e7eb",
        color: "#374151",
      },
    };
  };

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
    gap: "15px",
    marginTop: "20px",
  };

  const statCardStyle = {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "18px",
  };

  const jobsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  };

  const jobCardStyle = {
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
    fontWeight: "bold",
    fontSize: "13px",
    marginBottom: "16px",
  };

  const actionButtonBase = {
    width: "100%",
    border: "none",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
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
          <h1 style={{ margin: 0, color: "#111827" }}>My Jobs</h1>
          <p style={{ marginTop: "8px", color: "#6b7280" }}>
            Track the jobs you have accepted, started, and completed.
          </p>

          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                Total My Jobs
              </p>
              <h2 style={{ margin: "8px 0 0 0", color: "#111827" }}>
                {jobs.length}
              </h2>
            </div>

            <div style={statCardStyle}>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                Accepted
              </p>
              <h2 style={{ margin: "8px 0 0 0", color: "#1d4ed8" }}>
                {totalAccepted}
              </h2>
            </div>

            <div style={statCardStyle}>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                In Progress
              </p>
              <h2 style={{ margin: "8px 0 0 0", color: "#b45309" }}>
                {totalInProgress}
              </h2>
            </div>

            <div style={statCardStyle}>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                Completed
              </p>
              <h2 style={{ margin: "8px 0 0 0", color: "#15803d" }}>
                {totalCompleted}
              </h2>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <h2 style={{ margin: 0, color: "#111827" }}>Assigned Jobs</h2>
          <p style={{ marginTop: "8px", color: "#6b7280" }}>
            Start accepted jobs, complete jobs in progress, and keep track of finished work.
          </p>
        </div>

        {jobs.length === 0 ? (
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
            <h3 style={{ marginTop: 0, color: "#111827" }}>No jobs yet</h3>
            <p style={{ marginBottom: 0, color: "#6b7280" }}>
              Accepted jobs will appear here.
            </p>
          </div>
        ) : (
          <div style={jobsGridStyle}>
            {jobs.map((job) => {
              const badge = getStatusBadge(job.status);

              return (
                <div key={job.id} style={jobCardStyle}>
                  <h3 style={{ marginTop: 0, marginBottom: "18px", color: "#111827" }}>
                    {job.service}
                  </h3>

                  <div>
                    <div style={labelStyle}>Booking ID</div>
                    <div style={valueStyle}>#{job.id}</div>
                  </div>

                  <div>
                    <div style={labelStyle}>Customer Email</div>
                    <div style={valueStyle}>{job.email}</div>
                  </div>

                  <div>
                    <div style={labelStyle}>Price</div>
                    <div style={valueStyle}>
                      UGX {Number(job.price).toLocaleString()}
                    </div>
                  </div>

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

                  {(job.status === "accepted" ||
                    job.status === "in progress" ||
                    job.status === "completed") && (
                    <div style={phoneBoxStyle}>
                      <div style={labelStyle}>Customer Phone</div>
                      <div
                        style={{
                          ...valueStyle,
                          marginBottom: 0,
                          color: "#1d4ed8",
                        }}
                      >
                        {job.customer_phone ? job.customer_phone : "Phone not available yet"}
                      </div>
                    </div>
                  )}

                  {job.status === "accepted" && (
                    <button
                      onClick={() => startJob(job.id)}
                      style={{
                        ...actionButtonBase,
                        background: "#2563eb",
                      }}
                    >
                      Start Job
                    </button>
                  )}

                  {job.status === "in progress" && (
                    <button
                      onClick={() => completeJob(job.id)}
                      style={{
                        ...actionButtonBase,
                        background: "#16a34a",
                      }}
                    >
                      Complete Job
                    </button>
                  )}

                  {job.status === "completed" && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: "#ecfdf5",
                        color: "#15803d",
                        fontWeight: "bold",
                        textAlign: "center",
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      ✔ Done
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

export default CleanerMyJobs;