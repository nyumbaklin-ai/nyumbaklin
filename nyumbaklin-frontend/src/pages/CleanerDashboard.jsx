import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function CleanerDashboard() {
  const [jobs, setJobs] = useState([]);
  const token = localStorage.getItem("token");

  const fetchJobs = () => {
    fetch(`${API_URL}/cleaner/available-jobs`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setJobs(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const acceptJob = async (id) => {
    try {
      const response = await fetch(`${API_URL}/cleaner/accept-job/${id}`, {
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
      alert("Failed to accept job");
    }
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

  const locationBoxStyle = {
    marginBottom: "16px",
    padding: "12px",
    borderRadius: "12px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
  };

  const buttonStyle = {
    marginTop: "10px",
    padding: "10px 14px",
    background: "#111827",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "8px",
    fontWeight: "bold",
    width: "100%",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerCardStyle}>
          <h1 style={{ margin: 0, color: "#111827" }}>Cleaner Dashboard</h1>
          <p style={{ marginTop: "8px", color: "#6b7280" }}>
            View available cleaning jobs, including their location, and accept the ones you want to handle.
          </p>

          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                Available Jobs
              </p>
              <h2 style={{ margin: "8px 0 0 0", color: "#111827" }}>
                {jobs.length}
              </h2>
            </div>

            <div style={statCardStyle}>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                Status
              </p>
              <h2 style={{ margin: "8px 0 0 0", color: "#111827" }}>
                Ready to Accept
              </h2>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <h2 style={{ margin: 0, color: "#111827" }}>Available Jobs</h2>
          <p style={{ marginTop: "8px", color: "#6b7280" }}>
            These are jobs that have not yet been assigned to any cleaner.
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
            <h3 style={{ marginTop: 0, color: "#111827" }}>No jobs available</h3>
            <p style={{ marginBottom: 0, color: "#6b7280" }}>
              New jobs will appear here when customers make bookings.
            </p>
          </div>
        ) : (
          <div style={jobsGridStyle}>
            {jobs.map((job) => (
              <div key={job.id} style={jobCardStyle}>
                <h3 style={{ marginTop: 0, marginBottom: "18px", color: "#111827" }}>
                  {job.service}
                </h3>

                <div>
                  <div style={labelStyle}>📧 Customer Email</div>
                  <div style={valueStyle}>{job.email}</div>
                </div>

                <div>
                  <div style={labelStyle}>📅 Date</div>
                  <div style={valueStyle}>
                    {new Date(job.booking_date).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <div style={labelStyle}>💰 Price</div>
                  <div style={valueStyle}>
                    UGX {Number(job.price).toLocaleString()}
                  </div>
                </div>

                <div style={locationBoxStyle}>
                  <div style={labelStyle}>📍 Location</div>
                  <div
                    style={{
                      ...valueStyle,
                      marginBottom: 0,
                      color: "#166534",
                    }}
                  >
                    {job.address ? job.address : "Location not available"}
                  </div>
                </div>

                <button onClick={() => acceptJob(job.id)} style={buttonStyle}>
                  Accept Job
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CleanerDashboard;