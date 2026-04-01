import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Profile() {
  const [profile, setProfile] = useState({});
  const [phone, setPhone] = useState("");
  const token = localStorage.getItem("token");

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

  return (
    <div style={{ padding: "30px", maxWidth: "500px", margin: "auto" }}>
      <h2>My Profile</h2>

      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Role:</strong> {profile.role}</p>

      <div style={{ marginTop: "20px" }}>
        <label>Phone Number</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "8px",
            marginBottom: "10px",
          }}
        />

        <button onClick={updatePhone}>
          Update Phone
        </button>
      </div>
    </div>
  );
}

export default Profile;