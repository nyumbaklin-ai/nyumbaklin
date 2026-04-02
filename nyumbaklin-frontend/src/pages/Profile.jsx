import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Profile() {
  const [profile, setProfile] = useState({});
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const token = localStorage.getItem("token");

  const kampalaAreas = [
    "Ntinda",
    "Kisaasi",
    "Najjera",
    "Kyaliwajjala",
    "Bukoto",
    "Bugolobi",
    "Kibuli",
    "Muyenga",
    "Kansanga",
    "Makindye",
    "Rubaga",
    "Mengo",
    "Nansana",
    "Wakiso",
    "Kawempe",
    "Bwaise",
    "Kireka",
    "Namugongo",
    "Seeta",
    "Gayaza",
    "Entebbe",
    "Nakawa",
    "Banda",
    "Kasubi",
    "Munyonyo",
    "Bunga",
    "Luzira",
    "Najjanankumbi",
    "Lubowa",
    "Zzana",
    "Kitintale",
    "Kulambiro",
    "Naalya",
    "Kyebando",
    "Kamwokya",
    "Kololo",
    "Acacia",
    "Wandegeya",
    "Makerere",
    "Mulago",
    "Old Kampala",
    "Kabalagala",
    "Bukasa",
    "Sonde",
    "Mukono",
  ];

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/customers/profile`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();
      setProfile(data);
      setPhone(data.phone || "");
      setLocation(data.location || "");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updatePhone = async () => {
    try {
      const res = await fetch(`${API_URL}/customers/update-phone`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ phone }),
      });

      const msg = await res.text();
      alert(msg);
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Error updating phone");
    }
  };

  const updateLocation = async () => {
    if (!location) {
      alert("Please select a location");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/customers/update-location`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ location }),
      });

      const msg = await res.text();
      alert(msg);
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Error updating location");
    }
  };

  const pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
    padding: "30px 20px",
  };

  const containerStyle = {
    maxWidth: "700px",
    margin: "0 auto",
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.97)",
    borderRadius: "18px",
    padding: "28px",
    boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e5e7eb",
  };

  const infoGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginTop: "24px",
    marginBottom: "26px",
  };

  const infoBoxStyle = {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "18px",
  };

  const labelStyle = {
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "6px",
  };

  const valueStyle = {
    color: "#0f172a",
    fontSize: "16px",
    fontWeight: "700",
    wordBreak: "break-word",
  };

  const inputStyle = {
    width: "100%",
    padding: "13px 14px",
    marginTop: "8px",
    marginBottom: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "15px",
    boxSizing: "border-box",
    background: "#ffffff",
  };

  const buttonStyle = {
    width: "100%",
    background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
    color: "white",
    border: "none",
    padding: "13px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 18px rgba(37, 99, 235, 0.20)",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ marginBottom: "10px" }}>
            <h1 style={{ margin: 0, color: "#0f172a", fontSize: "32px" }}>
              My Profile
            </h1>
            <p style={{ marginTop: "10px", color: "#64748b", fontSize: "15px" }}>
              View your account details and keep your phone number and location up to date.
            </p>
          </div>

          <div style={infoGridStyle}>
            <div style={infoBoxStyle}>
              <div style={labelStyle}>Email</div>
              <div style={valueStyle}>{profile.email || "Not available"}</div>
            </div>

            <div style={infoBoxStyle}>
              <div style={labelStyle}>Role</div>
              <div style={{ ...valueStyle, textTransform: "capitalize" }}>
                {profile.role || "Not available"}
              </div>
            </div>

            <div style={infoBoxStyle}>
              <div style={labelStyle}>Current Location</div>
              <div style={valueStyle}>{profile.location || "Not set yet"}</div>
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "22px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#0f172a", fontSize: "22px" }}>
              Update Phone Number
            </h3>
            <p style={{ marginTop: "8px", color: "#64748b", fontSize: "14px" }}>
              Make sure your number is correct so customers, cleaners, and admin support can reach you when needed.
            </p>

            <label style={{ ...labelStyle, display: "block", marginTop: "18px" }}>
              Phone Number
            </label>

            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              style={inputStyle}
            />

            <button onClick={updatePhone} style={buttonStyle}>
              Update Phone
            </button>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "22px",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#0f172a", fontSize: "22px" }}>
              Update Location
            </h3>
            <p style={{ marginTop: "8px", color: "#64748b", fontSize: "14px" }}>
              Select your main working area so Nyumbaklin can prioritize nearby jobs for you.
            </p>

            <label style={{ ...labelStyle, display: "block", marginTop: "18px" }}>
              Location
            </label>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select your area</option>
              {kampalaAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            <button onClick={updateLocation} style={buttonStyle}>
              Update Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;