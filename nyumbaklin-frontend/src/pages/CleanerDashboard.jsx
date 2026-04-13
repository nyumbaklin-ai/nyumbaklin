import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function CleanerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [prevJobsCount, setPrevJobsCount] = useState(0);

  const token = localStorage.getItem("token");
  const audioReadyRef = useRef(false);

  // ================= ENABLE AUDIO =================
  const enableAudio = () => {
    audioReadyRef.current = true;
  };

  // ================= PLAY NOTIFICATION SOUND =================
  const playNotificationSound = () => {
    if (!audioReadyRef.current) return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.35
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.35);

      oscillator.onended = () => {
        audioContext.close();
      };
    } catch (error) {
      console.error("Notification sound failed:", error);
    }
  };

  // ================= FETCH JOBS =================
  const fetchJobs = () => {
    fetch(`${API_URL}/cleaner/available-jobs`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        const newJobs = Array.isArray(data) ? data : [];

        // 🔔 PLAY SOUND IF NEW JOBS ARRIVED
        if (newJobs.length > prevJobsCount && prevJobsCount !== 0) {
          playNotificationSound();
        }

        setPrevJobsCount(newJobs.length);
        setJobs(newJobs);
      })
      .catch((err) => console.error(err));
  };

  // ================= FETCH SUBSCRIPTION =================
  const fetchSubscription = async () => {
    try {
      const res = await fetch(`${API_URL}/cleaner/subscription-status`, {
        headers: { Authorization: "Bearer " + token },
      });

      const data = await res.json();
      setSubscription(data);
    } catch (err) {
      console.error("Subscription error:", err);
    }
  };

  // ================= UPGRADE =================
  const upgrade = async (plan) => {
    try {
      setLoadingSub(true);

      const res = await fetch(`${API_URL}/cleaner/upgrade-subscription`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      alert(data.message);

      fetchSubscription();
    } catch (err) {
      console.error(err);
      alert("Upgrade failed");
    } finally {
      setLoadingSub(false);
    }
  };

  // ================= ACCEPT JOB =================
  const acceptJob = async (id) => {
    try {
      const response = await fetch(`${API_URL}/cleaner/accept-job/${id}`, {
        method: "PUT",
        headers: { Authorization: "Bearer " + token },
      });

      const message = await response.text();
      alert(message);

      fetchJobs();
    } catch (error) {
      console.error(error);
      alert("Failed to accept job");
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchSubscription();

    const interval = setInterval(() => {
      fetchJobs();
    }, 5000);

    window.addEventListener("click", enableAudio);
    window.addEventListener("keydown", enableAudio);

    return () => {
      clearInterval(interval);
      window.removeEventListener("click", enableAudio);
      window.removeEventListener("keydown", enableAudio);
    };
  }, [prevJobsCount]);

  // ================= STYLES =================
  const pageStyle = {
    minHeight: "100vh",
    background: "#f4f7fb",
    padding: "30px 20px",
  };

  const containerStyle = {
    maxWidth: "1000px",
    margin: "0 auto",
  };

  const card = {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  };

  const jobCard = {
    background: "#fafafa",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "15px",
    border: "1px solid #e5e7eb",
  };

  const button = {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    color: "white",
    fontWeight: "bold",
  };

  const badge = (type) => ({
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "white",
    background: type === "premium" ? "#16a34a" : "#6b7280",
  });

  // ================= UI =================
  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* 🔥 SUBSCRIPTION CARD */}
        <div style={card}>
          <h2>💎 Subscription</h2>

          {subscription && (
            <>
              <div style={{ marginBottom: "10px" }}>
                <span style={badge(subscription.subscription_type)}>
                  {subscription.subscription_type || "ordinary"}
                </span>
              </div>

              <p>
                <b>Status:</b> {subscription.subscription_status || "inactive"}
              </p>

              {subscription.subscription_expiry && (
                <p>
                  <b>Expires:</b>{" "}
                  {new Date(
                    subscription.subscription_expiry
                  ).toLocaleDateString()}
                </p>
              )}
            </>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              style={{ ...button, background: "#16a34a" }}
              onClick={() => upgrade("weekly")}
              disabled={loadingSub}
            >
              Weekly (UGX 5,000)
            </button>

            <button
              style={{ ...button, background: "#2563eb" }}
              onClick={() => upgrade("monthly")}
              disabled={loadingSub}
            >
              Monthly (UGX 15,000)
            </button>
          </div>
        </div>

        {/* JOBS */}
        <div style={card}>
          <h2>Available Jobs ({jobs.length})</h2>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "5px" }}>
            Tap anywhere on this page once to enable notification sound.
          </p>

          {jobs.length === 0 ? (
            <p>No jobs available</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} style={jobCard}>
                <h3 style={{ marginBottom: "5px" }}>{job.service}</h3>

                <p>📧 {job.email}</p>
                <p>📅 {new Date(job.booking_date).toLocaleDateString()}</p>
                <p>💰 UGX {Number(job.price).toLocaleString()}</p>
                <p>📍 {job.address || "No location"}</p>

                <button
                  style={{
                    ...button,
                    background: "#111827",
                    width: "100%",
                    marginTop: "10px",
                  }}
                  onClick={() => acceptJob(job.id)}
                >
                  Accept Job
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default CleanerDashboard;