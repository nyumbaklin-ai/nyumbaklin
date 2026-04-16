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
  const audioRef = useRef(null);
  const isPlayingNotificationRef = useRef(false);

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
      if (audioContext && audioContext.state === "suspended") {
        await audioContext.resume();
      }

      if (!audioRef.current) {
        audioRef.current = new Audio("/nyumbaklin-notification.wav");
        audioRef.current.preload = "auto";
      }

      audioRef.current.muted = true;
      audioRef.current.currentTime = 0;

      try {
        await audioRef.current.play();
      } catch (error) {
        console.error("Silent unlock play failed:", error);
      }

      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.muted = false;
      audioRef.current.volume = 1;

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
    if (isPlayingNotificationRef.current) return;

    try {
      isPlayingNotificationRef.current = true;

      if (!audioRef.current) {
        audioRef.current = new Audio("/nyumbaklin-notification.wav");
        audioRef.current.preload = "auto";
      }

      const playOnce = async () => {
        if (!audioRef.current) return;

        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.muted = false;
        audioRef.current.volume = 1;

        try {
          await audioRef.current.play();
        } catch (error) {
          console.error("Single notification play failed:", error);
        }
      };

      await playOnce();

      setTimeout(() => {
        playOnce();
      }, 700);

      setTimeout(() => {
        playOnce();
      }, 1400);

      setTimeout(() => {
        playOnce();
      }, 2100);

      setTimeout(() => {
        playOnce();
      }, 2800);

      if (navigator.vibrate) {
        navigator.vibrate([500, 150, 500, 150, 500, 150, 500]);
      }

      setTimeout(() => {
        isPlayingNotificationRef.current = false;
      }, 4300);
    } catch (error) {
      console.error("Notification sound failed:", error);
      isPlayingNotificationRef.current = false;
    }
  };

  // ================= GPS HELPERS =================
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
        const hasNewJob = currentJobIds.some((id) => !previousJobIds.includes(id));

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
    audioRef.current = new Audio("/nyumbaklin-notification.wav");
    audioRef.current.preload = "auto";
    audioRef.current.volume = 1;

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

      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
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

  const gpsBoxStyle = {
    marginTop: "10px",
    marginBottom: "10px",
    padding: "12px",
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
    borderRadius: "12px",
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

  // ================= UI =================
  return (
    <div style={pageStyle} onClick={enableAudio} onTouchStart={enableAudio}>
      <div style={containerStyle}>
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
                  {new Date(subscription.subscription_expiry).toLocaleDateString()}
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
            jobs.map((job) => {
              const gpsLocation = parseGpsAddress(job.address);

              return (
                <div key={job.id} style={jobCard}>
                  <h3 style={{ marginBottom: "5px" }}>{job.service}</h3>

                  <p>📧 {job.email}</p>
                  <p>📅 {new Date(job.booking_date).toLocaleDateString()}</p>
                  <p>💰 UGX {Number(job.price).toLocaleString()}</p>

                  {gpsLocation ? (
                    <div style={gpsBoxStyle}>
                      <div style={{ ...gpsLabelStyle, marginBottom: "8px", fontSize: "13px" }}>
                        📍 Customer Location
                      </div>

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

                      <p
                        style={{
                          color: "#155e75",
                          fontSize: "14px",
                          marginTop: "10px",
                          marginBottom: "0",
                          lineHeight: "1.5",
                        }}
                      >
                        This job uses the customer&apos;s GPS location.
                      </p>

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
                    <p style={{ wordBreak: "break-word" }}>
                      📍 {job.address || "No location"}
                    </p>
                  )}

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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default CleanerDashboard;