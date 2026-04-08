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
    "Ntinda","Kisaasi","Najjera","Kyaliwajjala","Bukoto","Bugolobi","Kibuli","Muyenga",
    "Kansanga","Makindye","Rubaga","Mengo","Nansana","Wakiso","Kawempe","Bwaise",
    "Kireka","Namugongo","Seeta","Gayaza","Entebbe","Nakawa","Banda","Kasubi",
    "Munyonyo","Bunga","Luzira","Najjanankumbi","Lubowa","Zzana","Kitintale",
    "Kulambiro","Naalya","Kyebando","Kamwokya","Kololo","Acacia","Wandegeya",
    "Makerere","Mulago","Old Kampala","Kabalagala","Bukasa","Sonde","Mukono","Other"
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

    if (service === "Other" && (!customPrice || Number(customPrice) <= 0))
      return alert("Enter valid price");

    if (!area) return alert("Select location");

    if (area === "Other" && !customArea.trim())
      return alert("Enter location");

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
            : "✅ Booking successful!"
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

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
      <div style={{ width: "400px", background: "white", padding: "25px" }}>
        <h2>Book Cleaning</h2>

        <form onSubmit={handleBooking}>
          <p>Select Service</p>

          <label>
            <input
              type="radio"
              value="House Cleaning"
              checked={service === "House Cleaning"}
              onChange={(e) => setService(e.target.value)}
            />
            House Cleaning
          </label>
          <br /><br />

          <label>
            <input
              type="radio"
              value="Deep Cleaning"
              checked={service === "Deep Cleaning"}
              onChange={(e) => setService(e.target.value)}
            />
            Deep Cleaning
          </label>
          <br /><br />

          <label>
            <input
              type="radio"
              value="Office Cleaning"
              checked={service === "Office Cleaning"}
              onChange={(e) => setService(e.target.value)}
            />
            Office Cleaning
          </label>
          <br /><br />

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
            <>
              <br /><br />
              <input
                type="text"
                placeholder="Enter service type"
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
              />

              <br /><br />

              <input
                type="number"
                placeholder="Enter service price"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
              />
            </>
          )}

          {needsRoomSelection && (
            <>
              <p>Select Rooms</p>

              <label>
                <input type="radio" value="1-2" onChange={(e) => setRoomSize(e.target.value)} />
                1-2
              </label><br />

              <label>
                <input type="radio" value="3-4" onChange={(e) => setRoomSize(e.target.value)} />
                3-4
              </label><br />

              <label>
                <input type="radio" value="5-6" onChange={(e) => setRoomSize(e.target.value)} />
                5-6
              </label>

              <p>Price: UGX {getPrice().toLocaleString()}</p>
            </>
          )}

          <br />

          <p>Select Area</p>

          <select value={area} onChange={(e) => setArea(e.target.value)}>
            <option value="">Select</option>

            {kampalaAreas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>

          {area === "Other" && (
            <>
              <br /><br />
              <input
                type="text"
                placeholder="Enter your area"
                value={customArea}
                onChange={(e) => setCustomArea(e.target.value)}
              />
            </>
          )}

          <br /><br />

          <p>Select Date</p>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <br /><br />

          <p>Payment Method</p>

          <label>
            <input
              type="radio"
              value="pay_after"
              checked={paymentMethod === "pay_after"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Pay After Service (Recommended)
          </label>

          <br /><br />

          <label>
            <input
              type="radio"
              value="momo"
              checked={paymentMethod === "momo"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Pay with Mobile Money
          </label>

          <p style={{ fontSize: "15px", color: "gray" }}>
            Pay after service is safer and builds trust.
          </p>

          <p style={{ fontSize: "15px", color: "gray" }}>
            Prices include cleaner transport within Kampala.
          </p>

          <p style={{ fontSize: "15px", color: "gray" }}>
            Customer provides cleaning materials unless agreed otherwise.
          </p>

          <br />

          <button type="submit">Book Service</button>
        </form>
      </div>
    </div>
  );
}

export default CustomerBooking;