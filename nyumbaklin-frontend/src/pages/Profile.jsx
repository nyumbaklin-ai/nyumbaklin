import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Profile() {
  const [profile, setProfile] = useState({});
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

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

  const readResponseMessage = async (res, fallbackMessage) => {
    try {
      const data = await res.json();
      return data.message || fallbackMessage;
    } catch {
      try {
        const text = await res.text();
        return text || fallbackMessage;
      } catch {
        return fallbackMessage;
      }
    }
  };

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

      const msg = await readResponseMessage(
        res,
        res.ok ? "Phone updated successfully" : "Error updating phone"
      );

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

      const msg = await readResponseMessage(
        res,
        res.ok ? "Location updated successfully" : "Error updating location"
      );

      alert(msg);
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Error updating location");
    }
  };

  const changePassword = async () => {
    const cleanedCurrentPassword = currentPassword.trim();
    const cleanedNewPassword = newPassword.trim();
    const cleanedConfirmPassword = confirmPassword.trim();

    if (!cleanedCurrentPassword || !cleanedNewPassword || !cleanedConfirmPassword) {
      alert("Please fill in current password, new password, and confirm password.");
      return;
    }

    if (cleanedNewPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }

    if (cleanedNewPassword !== cleanedConfirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    if (cleanedCurrentPassword === cleanedNewPassword) {
      alert("New password must be different from current password.");
      return;
    }

    try {
      setChangingPassword(true);

      const res = await fetch(`${API_URL}/customers/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          current_password: cleanedCurrentPassword,
          new_password: cleanedNewPassword,
          confirm_password: cleanedConfirmPassword,
        }),
      });

      const msg = await readResponseMessage(
        res,
        res.ok ? "Password changed successfully" : "Error changing password"
      );

      alert(msg);

      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      alert("Error changing password");
    } finally {
      setChangingPassword(false);
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

  const sectionCardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "22px",
    marginBottom: "20px",
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
              View your account details and keep your phone number, location, and password up to date.
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

          <div style={sectionCardStyle}>
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

          <div style={sectionCardStyle}>
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

          <div
            style={{
              ...sectionCardStyle,
              marginBottom: 0,
              background: "#f8fafc",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#0f172a", fontSize: "22px" }}>
              Change Password
            </h3>

            <p style={{ marginTop: "8px", color: "#64748b", fontSize: "14px" }}>
              If admin gave you a temporary password, enter it as your current password, then set your own new password.
            </p>

            <label style={{ ...labelStyle, display: "block", marginTop: "18px" }}>
              Current Password
            </label>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              style={inputStyle}
            />

            <label style={{ ...labelStyle, display: "block" }}>
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              style={inputStyle}
            />

            <label style={{ ...labelStyle, display: "block" }}>
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              style={inputStyle}
            />

            <button
              onClick={changePassword}
              disabled={changingPassword}
              style={{
                ...buttonStyle,
                background: "linear-gradient(90deg, #7c3aed, #6d28d9)",
                boxShadow: "0 10px 18px rgba(124, 58, 237, 0.20)",
                opacity: changingPassword ? 0.7 : 1,
                cursor: changingPassword ? "not-allowed" : "pointer",
              }}
            >
              {changingPassword ? "Changing Password..." : "Change Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;