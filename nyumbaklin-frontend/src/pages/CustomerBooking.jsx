import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CustomerBooking() {
  const [service, setService] = useState("");
  const [customService, setCustomService] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [roomSize, setRoomSize] = useState("");
  const [date, setDate] = useState("");
  const [area, setArea] = useState("");
  const [customArea, setCustomArea] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pay_after");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const needsRoomSelection =
    service === "House Cleaning" ||
    service === "Deep Cleaning" ||
    service === "Office Cleaning";

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
    "Other",
  ];

  const getPrice = () => {
    if (service === "House Cleaning") {
      if (roomSize === "1-2") return 33000;
      if (roomSize === "3-4") return 48000;
      if (roomSize === "5-6") return 65000;
    }

    if (service === "Deep Cleaning") {
      if (roomSize === "1-2") return 75000;
      if (roomSize === "3-4") return 105000;
      if (roomSize === "5-6") return 135000;
    }

    if (service === "Office Cleaning") {
      if (roomSize === "1-2") return 65000;
      if (roomSize === "3-4") return 95000;
      if (roomSize === "5-6") return 125000;
    }

    if (service === "Other") return Number(customPrice);

    return 0;
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    const finalService = service === "Other" ? customService.trim() : service;
    const finalPrice = getPrice();
    const finalAddress = area === "Other" ? customArea.trim() : area;

    if (!finalService) return alert("Select service");
    if (needsRoomSelection && !roomSize) return alert("Select rooms");

    if (service === "Other" && (!customPrice || Number(customPrice) <= 0)) {
      return alert("Enter valid price");
    }

    if (!area) return alert("Select location");

    if (area === "Other" && !customArea.trim()) {
      return alert("Enter location");
    }

    if (!date) return alert("Select date");

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
          address: finalAddress,
          payment_method: paymentMethod,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          paymentMethod === "pay_after"
            ? "✅ Booking successful! Pay after service."
            : "✅ Booking received! Your Mobile Money payment will be verified before confirmation."
        );
        navigate("/my-bookings");
      } else {
        alert(data.message || "Booking failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error occurred");
    }
  };

  const pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "640px",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.10)",
    border: "1px solid #e5e7eb",
  };

  const headingStyle = {
    margin: 0,
    fontSize: "32px",
    color: "#0f172a",
    fontWeight: "800",
  };

  const subTextStyle = {
    marginTop: "10px",
    marginBottom: "28px",
    color: "#64748b",
    fontSize: "15px",
    lineHeight: "1.6",
  };

  const sectionTitleStyle = {
    marginTop: "24px",
    marginBottom: "14px",
    color: "#0f172a",
    fontSize: "18px",
    fontWeight: "700",
  };

  const optionBoxStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    border: "1px solid #dbe3ef",
    borderRadius: "14px",
    marginBottom: "12px",
    background: "#f8fafc",
    color: "#1e293b",
    fontWeight: "500",
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    background: "#ffffff",
    marginBottom: "14px",
  };

  const selectStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    background: "#ffffff",
    marginBottom: "14px",
  };

  const priceBoxStyle = {
    marginTop: "14px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "16px",
    padding: "16px",
  };

  const momoBoxStyle = {
    marginTop: "16px",
    background: "#fff7ed",
    border: "1px solid #fdba74",
    borderRadius: "16px",
    padding: "16px",
  };

  const noteStyle = {
    fontSize: "15px",
    color: "#64748b",
    marginTop: "10px",
    lineHeight: "1.6",
  };

  const buttonStyle = {
    width: "100%",
    marginTop: "24px",
    background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    border: "none",
    padding: "16px",
    borderRadius: "16px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(37, 99, 235, 0.25)",
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={headingStyle}>Book Cleaning</h2>
        <p style={subTextStyle}>
          Choose your service, area, date, and payment method to place your booking quickly and easily.
        </p>

        <form onSubmit={handleBooking}>
          <div>
            <p style={sectionTitleStyle}>Select Service</p>

            <label style={optionBoxStyle}>
              <input
                type="radio"
                value="House Cleaning"
                checked={service === "House Cleaning"}
                onChange={(e) => setService(e.target.value)}
              />
              House Cleaning
            </label>

            <label style={optionBoxStyle}>
              <input
                type="radio"
                value="Deep Cleaning"
                checked={service === "Deep Cleaning"}
                onChange={(e) => setService(e.target.value)}
              />
              Deep Cleaning
            </label>

            <label style={optionBoxStyle}>
              <input
                type="radio"
                value="Office Cleaning"
                checked={service === "Office Cleaning"}
                onChange={(e) => setService(e.target.value)}
              />
              Office Cleaning
            </label>

            <label style={optionBoxStyle}>
              <input
                type="radio"
                value="Other"
                checked={service === "Other"}
                onChange={(e) => setService(e.target.value)}
              />
              Other
            </label>

            {service === "Other" && (
              <div style={{ marginTop: "14px" }}>
                <input
                  type="text"
                  placeholder="Enter service type"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  style={inputStyle}
                />

                <input
                  type="number"
                  placeholder="Enter service price"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          {needsRoomSelection && (
            <div>
              <p style={sectionTitleStyle}>Select Rooms</p>

              <label style={optionBoxStyle}>
                <input
                  type="radio"
                  value="1-2"
                  checked={roomSize === "1-2"}
                  onChange={(e) => setRoomSize(e.target.value)}
                />
                1-2 Rooms
              </label>

              <label style={optionBoxStyle}>
                <input
                  type="radio"
                  value="3-4"
                  checked={roomSize === "3-4"}
                  onChange={(e) => setRoomSize(e.target.value)}
                />
                3-4 Rooms
              </label>

              <label style={optionBoxStyle}>
                <input
                  type="radio"
                  value="5-6"
                  checked={roomSize === "5-6"}
                  onChange={(e) => setRoomSize(e.target.value)}
                />
                5-6 Rooms
              </label>

              <div style={priceBoxStyle}>
                <p style={{ margin: 0, color: "#1d4ed8", fontSize: "14px", fontWeight: "600" }}>
                  Estimated Price
                </p>
                <p
                  style={{
                    margin: "8px 0 0 0",
                    color: "#0f172a",
                    fontSize: "24px",
                    fontWeight: "800",
                  }}
                >
                  UGX {getPrice().toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div>
            <p style={sectionTitleStyle}>Select Area</p>

            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              style={selectStyle}
            >
              <option value="">Select area</option>
              {kampalaAreas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>

            {area === "Other" && (
              <input
                type="text"
                placeholder="Enter your area"
                value={customArea}
                onChange={(e) => setCustomArea(e.target.value)}
                style={inputStyle}
              />
            )}
          </div>

          <div>
            <p style={sectionTitleStyle}>Select Date</p>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <p style={sectionTitleStyle}>Payment Method</p>

            <label style={optionBoxStyle}>
              <input
                type="radio"
                value="pay_after"
                checked={paymentMethod === "pay_after"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Pay After Service (Recommended)
            </label>

            <label style={optionBoxStyle}>
              <input
                type="radio"
                value="momo"
                checked={paymentMethod === "momo"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Pay with Mobile Money
            </label>

            {paymentMethod === "momo" && (
              <div style={momoBoxStyle}>
                <p
                  style={{
                    margin: "0 0 10px 0",
                    color: "#9a3412",
                    fontSize: "16px",
                    fontWeight: "700",
                  }}
                >
                  📲 Mobile Money Payment Instructions
                </p>

                <p style={{ margin: "0 0 8px 0", color: "#7c2d12", fontSize: "14px" }}>
                  1. Go to your Mobile Money menu on MTN or Airtel.
                </p>

                <p style={{ margin: "0 0 8px 0", color: "#7c2d12", fontSize: "14px" }}>
                  2. Send the full booking amount to:
                </p>

                <p
                  style={{
                    margin: "0 0 10px 0",
                    color: "#0f172a",
                    fontSize: "18px",
                    fontWeight: "800",
                  }}
                >
                  📞 0781812743
                </p>

                <p style={{ margin: "0 0 8px 0", color: "#7c2d12", fontSize: "14px" }}>
                  3. Use your phone number or name as payment reference.
                </p>

                <p style={{ margin: "0 0 8px 0", color: "#7c2d12", fontSize: "14px" }}>
                  4. After sending money, click <strong>Book Service</strong> to submit your booking.
                </p>

                <p
                  style={{
                    margin: "12px 0 0 0",
                    color: "#b91c1c",
                    fontSize: "13px",
                    fontWeight: "700",
                    lineHeight: "1.6",
                  }}
                >
                  ⚠️ Bookings paid by Mobile Money are confirmed after payment verification.
                </p>
              </div>
            )}

            <p style={noteStyle}>
              Pay after service is safer and builds trust.
            </p>

            <p style={noteStyle}>
              Prices include cleaner transport within Kampala.
            </p>

            <p style={noteStyle}>
              Customer provides cleaning materials unless agreed otherwise.
            </p>
          </div>

          <button type="submit" style={buttonStyle}>
            Book Service
          </button>
        </form>
      </div>
    </div>
  );
}

export default CustomerBooking;