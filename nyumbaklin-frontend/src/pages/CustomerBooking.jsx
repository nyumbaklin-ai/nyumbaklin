import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CustomerBooking() {
  const [service, setService] = useState("");
  const [customService, setCustomService] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [roomSize, setRoomSize] = useState("");
  const [date, setDate] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const needsRoomSelection =
    service === "House Cleaning" ||
    service === "Deep Cleaning" ||
    service === "Office Cleaning";

  const getPrice = () => {
    if (service === "House Cleaning") {
      if (roomSize === "1-2") return 30000;
      if (roomSize === "3-4") return 45000;
      if (roomSize === "5-6") return 60000;
    }

    if (service === "Deep Cleaning") {
      if (roomSize === "1-2") return 70000;
      if (roomSize === "3-4") return 100000;
      if (roomSize === "5-6") return 130000;
    }

    if (service === "Office Cleaning") {
      if (roomSize === "1-2") return 60000;
      if (roomSize === "3-4") return 90000;
      if (roomSize === "5-6") return 120000;
    }

    if (service === "Other") return Number(customPrice);

    return 0;
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    const finalService = service === "Other" ? customService.trim() : service;
    const finalPrice = getPrice();

    if (!finalService) {
      alert("Please select or enter a service");
      return;
    }

    if (needsRoomSelection && !roomSize) {
      alert("Please select the number of rooms");
      return;
    }

    if (service === "Other" && !customPrice) {
      alert("Please enter the price for the other service");
      return;
    }

    if (service === "Other" && Number(customPrice) <= 0) {
      alert("Please enter a valid price greater than 0");
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
          service:
            service === "Other"
              ? finalService
              : `${finalService} (${roomSize} rooms)`,
          booking_date: date,
          price: finalPrice,
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
        minHeight: "80vh",
        padding: "20px",
      }}
    >
      <div
        style={{
          padding: "30px",
          border: "1px solid #ccc",
          borderRadius: "10px",
          width: "350px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          background: "white",
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
              onChange={(e) => {
                setService(e.target.value);
                setCustomService("");
                setCustomPrice("");
                setRoomSize("");
              }}
            />
            House Cleaning
          </label>

          <br />
          <br />

          <label>
            <input
              type="radio"
              value="Deep Cleaning"
              checked={service === "Deep Cleaning"}
              onChange={(e) => {
                setService(e.target.value);
                setCustomService("");
                setCustomPrice("");
                setRoomSize("");
              }}
            />
            Deep Cleaning
          </label>

          <br />
          <br />

          <label>
            <input
              type="radio"
              value="Office Cleaning"
              checked={service === "Office Cleaning"}
              onChange={(e) => {
                setService(e.target.value);
                setCustomService("");
                setCustomPrice("");
                setRoomSize("");
              }}
            />
            Office Cleaning
          </label>

          <br />
          <br />

          <label>
            <input
              type="radio"
              value="Other"
              checked={service === "Other"}
              onChange={(e) => {
                setService(e.target.value);
                setRoomSize("");
              }}
            />
            Other
          </label>

          {needsRoomSelection && (
            <>
              <p style={{ marginTop: "15px", marginBottom: "10px" }}>
                Select Number of Rooms
              </p>

              <label>
                <input
                  type="radio"
                  value="1-2"
                  checked={roomSize === "1-2"}
                  onChange={(e) => setRoomSize(e.target.value)}
                />
                1 - 2 rooms
              </label>

              <br />
              <br />

              <label>
                <input
                  type="radio"
                  value="3-4"
                  checked={roomSize === "3-4"}
                  onChange={(e) => setRoomSize(e.target.value)}
                />
                3 - 4 rooms
              </label>

              <br />
              <br />

              <label>
                <input
                  type="radio"
                  value="5-6"
                  checked={roomSize === "5-6"}
                  onChange={(e) => setRoomSize(e.target.value)}
                />
                5 - 6 rooms
              </label>

              <p
                style={{
                  marginTop: "12px",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Estimated Price: UGX {getPrice().toLocaleString()}
              </p>
            </>
          )}

          {service === "Other" && (
            <>
              <input
                type="text"
                placeholder="Describe service"
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "8px",
                  boxSizing: "border-box",
                }}
                required
              />

              <input
                type="number"
                placeholder="Enter price in UGX"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "8px",
                  boxSizing: "border-box",
                }}
                min="1"
                required
              />

              <p
                style={{
                  marginTop: "10px",
                  color: "#374151",
                  fontSize: "14px",
                }}
              >
                Set the price for this custom service in UGX.
              </p>
            </>
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