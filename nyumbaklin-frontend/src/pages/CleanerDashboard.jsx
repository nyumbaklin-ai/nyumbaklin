import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function CleanerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const token = localStorage.getItem("token");

  const prevJobIdsRef = useRef([]);
  const audioContextRef = useRef(null);
  const enablingAudioRef = useRef(false);
  const audioEnabledRef = useRef(false);
  const hasLoadedOnceRef = useRef(false);

  // ================= KEEP AUDIO STATE IN REF =================
  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  // ================= GET / CREATE AUDIO CONTEXT =================
  const getAudioContext = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    return audioContextRef.current;
  };

  // ================= ENABLE AUDIO =================
  const enableAudio = async () => {
    if (enablingAudioRef.current) return;

    try {
      enablingAudioRef.current = true;

      const audioContext = getAudioContext();
      if (!audioContext) return;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      // Small warm-up beep to unlock mobile audio
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.00001,
        audioContext.currentTime + 0.05
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);

      setAudioEnabled(true);
    } catch (error) {
      console.error("Audio enable failed:", error);
    } finally {
      enablingAudioRef.current = false;
    }
  };

  // ================= PLAY NOTIFICATION SOUND =================
  const playNotificationSound = async () => {
    if (!audioEnabledRef.current) return;

    try {
      const audioContext = getAudioContext();
      if (!audioContext) return;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const now = audioContext.currentTime;

      const oscillator1 = audioContext.createOscillator();
      const gainNode1 = audioContext.createGain();

      oscillator1.type = "sine";
      oscillator1.frequency.setValueAtTime(880, now);

      gainNode1.gain.setValueAtTime(0.18, now);
      gainNode1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      oscillator1.connect(gainNode1);
      gainNode1.connect(audioContext.destination);

      oscillator1.start(now);
      oscillator1.stop(now + 0.18);

      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();

      oscillator2.type = "sine";
      oscillator2.frequency.setValueAtTime(988, now + 0.2);

      gainNode2.gain.setValueAtTime(0.14, now + 0.2);
      gainNode2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);

      oscillator2.start(now + 0.2);
      oscillator2.stop(now + 0.38);
    } catch (error) {
      console.error("Notification sound failed:", error);
    }
  };

  // ================= FETCH JOBS =================
  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/cleaner/available-jobs`, {
        headers: { Authorization: "Bearer " + token },
      });

      const data = await res.json();
      const newJobs = Array.isArray(data) ? data : [];

      const currentJobIds = newJobs.map((job) => job.id);
      const previousJobIds = prevJobIdsRef.current;

      if (hasLoadedOnceRef.current) {
        const hasNewJob = currentJobIds.some(
          (id) => !previousJobIds.includes(id)
        );

        if (hasNewJob) {
          playNotificationSound();
        }
      }

      prevJobIdsRef.current = currentJobIds;
      setJobs(newJobs);
      hasLoadedOnceRef.current = true;
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
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

  // ================= INITIAL LOAD + POLLING =================
  useEffect(() => {
    fetchJobs();
    fetchSubscription();

    const interval = setInterval(() => {
      fetchJobs();
    }, 2000);

    window.addEventListener("click", enableAudio);
    window.addEventListener("keydown", enableAudio);
    window.addEventListener("touchstart", enableAudio);
    window.addEventListener("pointerdown", enableAudio);

    return () => {
      clearInterval(interval);
      window.removeEventListener("click", enableAudio);
      window.removeEventListener("keydown", enableAudio);
      window.removeEventListener("touchstart", enableAudio);
      window.removeEventListener("pointerdown", enableAudio);

      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
    };
  }, []);

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
    <div style={pageStyle} onClick={enableAudio} onTouchStart={enableAudio}>
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

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
              flexWrap: "wrap",
            }}
          >
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
            {audioEnabled
              ? "✅ Notification sound is enabled."
              : "Tap the button below once to enable notification sound."}
          </p>

          {!audioEnabled && (
            <button
              style={{
                ...button,
                background: "#111827",
                marginTop: "10px",
                marginBottom: "15px",
              }}
              onClick={enableAudio}
              onTouchStart={enableAudio}
            >
              Enable Sound
            </button>
          )}

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