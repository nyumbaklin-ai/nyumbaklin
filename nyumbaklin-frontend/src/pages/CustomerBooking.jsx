import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CustomerBooking() {
  const [service, setService] = useState("");
  const [customService, setCustomService] = useState("");
  const [date, setDate] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const getPrice = () => {
    if (service === "House Cleaning") return 50000;
    if (service === "Deep Cleaning") return 80000;
    if (service === "Office Cleaning") return 100000;
    return 0;
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    const finalService = service === "Other" ? customService.trim() : service;

    if (!finalService) {
      alert("Please select or enter a service");
      return;
    }

    if (!date) {
      alert("Please select a booking date");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/customers/book-service`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          service: finalService,
          booking_date: date,
          price: service === "Other" ? 0 : getPrice(),
        }),
      });

      const contentType = response.headers.get("content-type");

      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (response.ok) {
        alert(
          typeof data === "object"
            ? data.message || "✅ Booking successful!"
            : data || "✅ Booking successful!"
        );
        navigate("/my-bookings");
      } else {
        alert(
          typeof data === "object"
            ? data.message || "Booking failed"
            : data || "Booking failed"
        );
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
      }}
    >
      <div
        style={{
          padding: "30px",
          border: "1px solid #ccc",
          borderRadius: "10px",
          width: "350px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Book Cleaning</h2>

        <form onSubmit={handleBooking}>
          <p>Select Service</p>

          <label>
            <input
              type="radio"
              value="House Cleaning"
              checked={service === "House Cleaning"}
              onChange={(e) => setService(e.target.value)}
            />
            House Cleaning (UGX 50,000)
          </label>

          <br />
          <br />

          <label>
            <input
              type="radio"
              value="Deep Cleaning"
              checked={service === "Deep Cleaning"}
              onChange={(e) => setService(e.target.value)}
            />
            Deep Cleaning (UGX 80,000)
          </label>

          <br />
          <br />

          <label>
            <input
              type="radio"
              value="Office Cleaning"
              checked={service === "Office Cleaning"}
              onChange={(e) => setService(e.target.value)}
            />
            Office Cleaning (UGX 100,000)
          </label>

          <br />
          <br />

          <label>
            <input
              type="radio"
              value="Other"
              checked={service === "Other"}
              onChange={(e) => setService(e.target.value)}
            />
            Other
          </label>

          {service === "Other" && (
            <input
              type="text"
              placeholder="Describe service"
              value={customService}
              onChange={(e) => setCustomService(e.target.value)}
              style={{ width: "100%", marginTop: "10px" }}
              required
            />
          )}

          <br />
          <br />

          <p>Select Date</p>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: "100%" }}
            required
          />

          <br />
          <br />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              background: "black",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Book Service
          </button>
        </form>
      </div>
    </div>
  );
}

export default CustomerBooking;