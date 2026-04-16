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

  const getStatusMessage = (status) => {
    if (status === "accepted") {
      return "You have accepted this job. You can now start it.";
    }
    if (status === "in progress") {
      return "You are currently working on this job.";
    }
    if (status === "completed") {
      return "This job has been completed successfully.";
    }
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

  const getStatusBadge = (status) => {
    if (status === "accepted") {
      return { text: "Accepted", style: { background: "#dbeafe", color: "#1d4ed8" } };
    }
    if (status === "in progress") {
      return { text: "In Progress", style: { background: "#fef3c7", color: "#b45309" } };
    }
    if (status === "completed") {
      return { text: "Completed", style: { background: "#dcfce7", color: "#15803d" } };
    }
    return { text: status, style: { background: "#e5e7eb", color: "#374151" } };
  };

  const notificationStyle = {
    marginTop: "-4px",
    marginBottom: "14px",
    padding: "10px 12px",
    borderRadius: "10px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: "14px",
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

  const gpsBoxStyle = {
    marginBottom: "16px",
    padding: "12px",
    borderRadius: "12px",
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
    marginBottom: "10px",
  };

  const gpsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px",
    marginTop: "8px",
  };

  const gpsItemStyle = {
    background: "white",
    border: "1px solid #bae6fd",
    borderRadius: "10px",
    padding: "10px",
  };

  const gpsLabelStyle = {
    color: "#6b7280",
    fontSize: "12px",
    marginBottom: "4px",
    fontWeight: "600",
  };

  const gpsValueStyle = {
    color: "#111827",
    fontSize: "15px",
    fontWeight: "700",
    wordBreak: "break-word",
  };

  const mapButtonStyle = {
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

  const contactActionsStyle = {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
    flexWrap: "wrap",
  };

  const contactLinkStyle = {
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerCardStyle}>
          <h1>My Jobs</h1>
        </div>

        <div style={jobsGridStyle}>
          {jobs.map((job) => {
            const badge = getStatusBadge(job.status);
            const whatsappPhone = formatPhoneForWhatsApp(job.customer_phone);
            const gpsLocation = parseGpsAddress(job.address);

            return (
              <div key={job.id} style={jobCardStyle}>
                <h3>{job.service}</h3>

                <div style={labelStyle}>📧 Customer Email</div>
                <div style={valueStyle}>{job.email}</div>

                <div style={labelStyle}>💰 Price</div>
                <div style={valueStyle}>
                  UGX {Number(job.price).toLocaleString()}
                </div>

                {gpsLocation ? (
                  <div style={gpsBoxStyle}>
                    <div style={labelStyle}>📍 Customer Location</div>
                    <div style={gpsBadgeStyle}>GPS Location</div>

                    <div style={gpsGridStyle}>
                      <div style={gpsItemStyle}>
                        <div style={gpsLabelStyle}>Latitude</div>
                        <div style={gpsValueStyle}>{gpsLocation.latitude}</div>
                      </div>

                      <div style={gpsItemStyle}>
                        <div style={gpsLabelStyle}>Longitude</div>
                        <div style={gpsValueStyle}>{gpsLocation.longitude}</div>
                      </div>

                      {gpsLocation.accuracy && (
                        <div style={gpsItemStyle}>
                          <div style={gpsLabelStyle}>Accuracy</div>
                          <div style={gpsValueStyle}>{gpsLocation.accuracy} meters</div>
                        </div>
                      )}

                      {job.gps_readable_location && (
  <div style={gpsItemStyle}>
    <div style={gpsLabelStyle}>Approx Area</div>
    <div style={gpsValueStyle}>{job.gps_readable_location}</div>
  </div>
)}
                    </div>

                    <div
                      style={{
                        color: "#155e75",
                        fontSize: "14px",
                        marginTop: "10px",
                        lineHeight: "1.5",
                      }}
                    >
                      This job uses the customer&apos;s GPS location.
                    </div>

                    <a
                      href={getGoogleMapsLink(gpsLocation.latitude, gpsLocation.longitude)}
                      target="_blank"
                      rel="noreferrer"
                      style={mapButtonStyle}
                    >
                      Open in Google Maps
                    </a>
                  </div>
                ) : (
                  <div style={locationBoxStyle}>
                    <div style={labelStyle}>📍 Location</div>
                    <div style={{ ...valueStyle, marginBottom: 0, color: "#166534" }}>
                      {job.address ? job.address : "Location not available"}
                    </div>
                  </div>
                )}

                <div style={labelStyle}>📦 Status</div>
                <div style={{ ...badgeBaseStyle, ...badge.style }}>
                  {badge.text}
                </div>

                <div style={notificationStyle}>
                  {getStatusMessage(job.status)}
                </div>

                {(job.status === "accepted" ||
                  job.status === "in progress" ||
                  job.status === "completed") && (
                  <div style={phoneBoxStyle}>
                    <div style={labelStyle}>Customer Phone</div>
                    <div style={{ ...valueStyle, color: "#1d4ed8" }}>
                      {job.customer_phone}
                    </div>

                    <div style={contactActionsStyle}>
                      <a
                        href={`tel:${job.customer_phone}`}
                        style={{ ...contactLinkStyle, background: "#2563eb", color: "white" }}
                      >
                        Call
                      </a>

                      <a
                        href={`https://wa.me/${whatsappPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ ...contactLinkStyle, background: "#16a34a", color: "white" }}
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                )}

                {job.status === "accepted" && (
                  <button
                    onClick={() => startJob(job.id)}
                    style={{ ...actionButtonBase, background: "#2563eb" }}
                  >
                    Start Job
                  </button>
                )}

                {job.status === "in progress" && (
                  <button
                    onClick={() => completeJob(job.id)}
                    style={{ ...actionButtonBase, background: "#16a34a" }}
                  >
                    Complete Job
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CleanerMyJobs;