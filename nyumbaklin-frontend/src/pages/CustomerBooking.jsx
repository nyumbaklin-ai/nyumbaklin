import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CustomerBooking() {
  const [service, setService] = useState("");
  const [customService, setCustomService] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [roomSize, setRoomSize] = useState("");
  const [carpetType, setCarpetType] = useState("");
  const [date, setDate] = useState("");
  const [area, setArea] = useState("");
  const [customArea, setCustomArea] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pay_after");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsTimestamp, setGpsTimestamp] = useState("");
  const [gpsReadableLocation, setGpsReadableLocation] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingMessageType, setBookingMessageType] = useState("error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [servicePrices, setServicePrices] = useState([]);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [pricesError, setPricesError] = useState("");
  const [serviceAddons, setServiceAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [addonsLoading, setAddonsLoading] = useState(false);
  const [addonsError, setAddonsError] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const needsRoomSelection =
    service === "House Cleaning" ||
    service === "Deep Cleaning" ||
    service === "Office Cleaning" ||
    service === "Sofa Set Cleaning" ||
    service === "Carpet Cleaning" ||
    service === "Mobile Car Washing";


  useEffect(() => {
    let cancelled = false;

    const fetchServicePrices = async () => {
      try {
        setPricesLoading(true);
        setPricesError("");

        const response = await fetch(`${API_URL}/customers/service-prices`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(data?.message || "Could not load current service prices");
        }

        if (!cancelled) {
          setServicePrices(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Service prices error:", error);

        if (!cancelled) {
          setServicePrices([]);
          setPricesError(
            "Current service prices could not be loaded. Please refresh the page and try again."
          );
        }
      } finally {
        if (!cancelled) {
          setPricesLoading(false);
        }
      }
    };

    fetchServicePrices();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
  let cancelled = false;

  const fetchServiceAddons = async () => {
    if (service !== "Deep Cleaning") {
      setServiceAddons([]);
      setSelectedAddons([]);
      setAddonsError("");
      setAddonsLoading(false);
      return;
    }

    try {
      setAddonsLoading(true);
      setAddonsError("");

      const response = await fetch(
        `${API_URL}/customers/service-addons?service_name=${encodeURIComponent(
          "Deep Cleaning"
        )}`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(
          data?.message || "Could not load available add-ons"
        );
      }

      if (!cancelled) {
        setServiceAddons(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Service add-ons error:", error);

      if (!cancelled) {
        setServiceAddons([]);
        setAddonsError(
          "Available add-ons could not be loaded. Please refresh and try again."
        );
      }
    } finally {
      if (!cancelled) {
        setAddonsLoading(false);
      }
    }
  };

  fetchServiceAddons();

  return () => {
    cancelled = true;
  };
}, [service, token]);

  const getBookingServiceName = () => {
    const finalService = service === "Other" ? customService.trim() : service;

    if (!finalService) return "";

    if (
      service === "House Cleaning" ||
      service === "Deep Cleaning" ||
      service === "Office Cleaning"
    ) {
      return roomSize ? `${finalService} (${roomSize} rooms)` : "";
    }

    if (service === "Sofa Set Cleaning") {
      return roomSize ? `${finalService} (${roomSize})` : "";
    }

    if (service === "Carpet Cleaning") {
      return roomSize && carpetType
        ? `${finalService} (${roomSize}, ${carpetType})`
        : "";
    }

    if (service === "Mobile Car Washing") {
      return roomSize ? `${finalService} (${roomSize})` : "";
    }

    return finalService;
  };

  const getManagedPrice = (bookingServiceName) => {
    if (!bookingServiceName) return 0;

    const priceItem = servicePrices.find(
      (item) => item.booking_service === bookingServiceName
    );

    return priceItem ? Number(priceItem.price) : 0;
  };

  const formatManagedPrice = (bookingServiceName) => {
    const price = getManagedPrice(bookingServiceName);

    if (price > 0) {
      return `UGX ${price.toLocaleString()}`;
    }

    return pricesLoading ? "Loading price..." : "Price unavailable";
  };

  const showBookingMessage = (message, type = "error") => {
    setBookingMessage(message);
    setBookingMessageType(type);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const clearBookingMessage = () => {
    if (bookingMessage) {
      setBookingMessage("");
    }
  };

  const toggleAddon = (addonCode) => {
  clearBookingMessage();

  setSelectedAddons((current) =>
    current.includes(addonCode)
      ? current.filter((code) => code !== addonCode)
      : [...current, addonCode]
  );
};

const getAddonTotal = () => {
  if (service !== "Deep Cleaning") return 0;

  const fixedAddonCodes = [
    "inside_refrigerator",
    "inside_oven",
    "inside_kitchen_cabinets",
  ];

  const hasAllThreeFixedAddons = fixedAddonCodes.every((code) =>
    selectedAddons.includes(code)
  );

  if (hasAllThreeFixedAddons) {
    return 25000;
  }

  return serviceAddons
    .filter(
      (addon) =>
        selectedAddons.includes(addon.addon_code) &&
        !addon.requires_assessment
    )
    .reduce((total, addon) => total + Number(addon.price || 0), 0);
};

const getEstimatedTotalPrice = () => {
  return getPrice() + getAddonTotal();
};

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

  const getReadableLocationFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
          latitude
        )}&lon=${encodeURIComponent(longitude)}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": "en",
          },
        }
      );

      if (!response.ok) {
        return "";
      }

      const data = await response.json();
      const address = data.address || {};

      const parts = [
        address.road,
        address.neighbourhood,
        address.suburb,
        address.city_district,
        address.city || address.town || address.village,
      ].filter(Boolean);

      const uniqueParts = [...new Set(parts)];
      return uniqueParts.slice(0, 3).join(", ");
    } catch (error) {
      console.error("Readable location error:", error);
      return "";
    }
  };

  const getPrice = () => {
    if (service === "Other") {
      return Number(customPrice);
    }

    return getManagedPrice(getBookingServiceName());
  };

  const handleUseCurrentLocation = () => {
    clearBookingMessage();

    if (!navigator.geolocation) {
      setLocationMessage("GPS is not supported on this device/browser.");
      return;
    }

    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setLocationMessage("GPS needs HTTPS or localhost to work on this device.");
      return;
    }

    setGettingLocation(true);
    setLocationMessage("Getting your current location... Please allow GPS access.");
    setGpsAccuracy(null);
    setGpsTimestamp("");
    setGpsReadableLocation("");

    const savePosition = async (position) => {
      const latitude = position.coords.latitude.toFixed(6);
      const longitude = position.coords.longitude.toFixed(6);
      const accuracy =
        typeof position.coords.accuracy === "number"
          ? Math.round(position.coords.accuracy)
          : null;

      const capturedTime = new Date(position.timestamp).toLocaleString();

      setArea("Other");
      setCustomArea(
        accuracy
          ? `GPS: ${latitude}, ${longitude} (Accuracy: ${accuracy}m)`
          : `GPS: ${latitude}, ${longitude}`
      );
      setGpsAccuracy(accuracy);
      setGpsTimestamp(capturedTime);
      setLocationMessage("✅ GPS coordinates captured. Finding approximate area...");

      const readableLocation = await getReadableLocationFromCoordinates(
        latitude,
        longitude
      );

      if (readableLocation) {
        setGpsReadableLocation(readableLocation);

        if (accuracy && accuracy <= 50) {
          setLocationMessage("✅ GPS location added successfully. Approx area found.");
        } else if (accuracy && accuracy > 50) {
          setLocationMessage(
            "✅ GPS location added and approx area found, but accuracy is a bit low. You can edit the location if needed."
          );
        } else {
          setLocationMessage(
            "✅ GPS location added and approx area found. You can still edit it if needed."
          );
        }
      } else {
        if (accuracy && accuracy <= 50) {
          setLocationMessage(
            "✅ GPS coordinates were captured, but approx area could not be found. You can still continue or edit the location manually."
          );
        } else {
          setLocationMessage(
            "✅ GPS coordinates were captured. Approx area could not be found, and accuracy may not be perfect. You can still continue or edit the location manually."
          );
        }
      }

      setGettingLocation(false);
    };

    const handleFinalError = (error) => {
      console.error("Location error:", error);

      if (error.code === 1) {
        setLocationMessage(
          "Location permission denied. Please allow GPS access in your browser and try again."
        );
      } else if (error.code === 2) {
        setLocationMessage(
          "Unable to detect your location right now. Move to an open area or check your internet/GPS, then try again."
        );
      } else if (error.code === 3) {
        setLocationMessage(
          "Location request timed out. Please try again or enter your area manually."
        );
      } else {
        setLocationMessage(
          "Failed to get location. Please try again or enter your area manually."
        );
      }

      setGettingLocation(false);
    };

    navigator.geolocation.getCurrentPosition(
      savePosition,
      (error) => {
        if (error.code === 3) {
          setLocationMessage("GPS is taking long. Retrying with normal accuracy...");

          navigator.geolocation.getCurrentPosition(savePosition, handleFinalError, {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 60000,
          });
        } else {
          handleFinalError(error);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    clearBookingMessage();

    const finalService = service === "Other" ? customService.trim() : service;
    const bookingServiceName = getBookingServiceName();
    const finalPrice = getPrice();
    const finalAddress = area === "Other" ? customArea.trim() : area;
    const isGpsAddress = finalAddress.startsWith("GPS:");

    if (!finalService) {
      showBookingMessage("Please select a service.");
      return;
    }

    if (needsRoomSelection && !roomSize) {
  if (
    service === "House Cleaning" ||
    service === "Deep Cleaning" ||
    service === "Office Cleaning"
  ) {
    showBookingMessage("Please select the number of rooms.");
  } else if (service === "Sofa Set Cleaning") {
    showBookingMessage("Please select your sofa set size.");
  } else if (service === "Carpet Cleaning") {
    showBookingMessage("Please select your carpet size.");
  } else if (service === "Mobile Car Washing") {
    showBookingMessage("Please select your vehicle type.");
  }

  return;
}
   
  if (service === "Carpet Cleaning" && !carpetType) {
  showBookingMessage("Please select your carpet type.");
  return;
}
  
    if (service === "Other" && (!customPrice || Number(customPrice) <= 0)) {
      showBookingMessage("Please enter a valid price for the custom service.");
      return;
    }

    if (service !== "Other" && pricesLoading) {
      showBookingMessage("Current service prices are still loading. Please wait a moment.");
      return;
    }

    if (service !== "Other" && (!bookingServiceName || finalPrice <= 0)) {
      showBookingMessage(
        "The current price for this service could not be loaded. Please refresh the page and try again."
      );
      return;
    }

    if (!area) {
      showBookingMessage("Please select your location or area.");
      return;
    }

    if (area === "Other" && !customArea.trim()) {
      showBookingMessage("Please enter your location, landmark, or GPS location.");
      return;
    }

    if (!date) {
      showBookingMessage("Please select a booking date.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_URL}/customers/book-service`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          service: bookingServiceName,
          booking_date: date,
          price: finalPrice,
          address: finalAddress,
          payment_method: paymentMethod,
          gps_readable_location: isGpsAddress ? gpsReadableLocation || null : null,
          addons: service === "Deep Cleaning" ? selectedAddons : [],
        }),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.ok) {
        showBookingMessage(
          paymentMethod === "pay_after"
            ? "✅ Booking successful! Pay after service."
            : "✅ Booking successful! If you have paid, submit your transaction ID in My Bookings.",
          "success"
        );

        setTimeout(() => {
          navigate("/my-bookings");
        }, 1200);
      } else {
        showBookingMessage(data.message || "Booking failed. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Booking error:", error);

      if (!navigator.onLine) {
        showBookingMessage("No internet connection. Please check your network and try again.");
      } else {
        showBookingMessage("Something went wrong while sending your booking. Please try again.");
      }

      setIsSubmitting(false);
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

  const gpsBoxStyle = {
    marginTop: "12px",
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
    borderRadius: "16px",
    padding: "14px",
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
    cursor: isSubmitting ? "not-allowed" : "pointer",
    boxShadow: "0 14px 28px rgba(37, 99, 235, 0.25)",
    opacity: isSubmitting ? 0.75 : 1,
  };

  const gpsButtonStyle = {
    width: "100%",
    background: "linear-gradient(90deg, #0891b2, #0e7490)",
    color: "#ffffff",
    border: "none",
    padding: "14px 16px",
    borderRadius: "14px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: gettingLocation ? "not-allowed" : "pointer",
    marginBottom: "14px",
    boxShadow: "0 10px 22px rgba(8, 145, 178, 0.22)",
    opacity: gettingLocation ? 0.75 : 1,
  };

  const messageBoxStyle = {
    marginBottom: "18px",
    padding: "14px 16px",
    borderRadius: "16px",
    border:
      bookingMessageType === "success"
        ? "1px solid #bbf7d0"
        : "1px solid #fecaca",
    background:
      bookingMessageType === "success"
        ? "linear-gradient(135deg, #f0fdf4, #dcfce7)"
        : "linear-gradient(135deg, #fef2f2, #fee2e2)",
    color: bookingMessageType === "success" ? "#166534" : "#991b1b",
    fontSize: "15px",
    fontWeight: "700",
    lineHeight: "1.5",
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={headingStyle}>Book a Service</h2>
        <p style={subTextStyle}>
          Choose your service, area, date, and payment method to place your booking quickly and easily.
        </p>

        {bookingMessage && (
          <div style={messageBoxStyle}>
            {bookingMessage}
          </div>
        )}

        {pricesLoading && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 16px",
              borderRadius: "14px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#1d4ed8",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            Loading current service prices...
          </div>
        )}

        {pricesError && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 16px",
              borderRadius: "14px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            {pricesError}
          </div>
        )}

        <form onSubmit={handleBooking}>
          <div>
            <p style={sectionTitleStyle}>Select Service</p>

            <label style={optionBoxStyle}>
              <input
                type="radio"
                value="House Cleaning"
                checked={service === "House Cleaning"}
                onChange={(e) => {
                  clearBookingMessage();
                  setService(e.target.value);
                }}
              />
              House Cleaning
            </label>

            <label style={optionBoxStyle}>
              <input
                type="radio"
                value="Deep Cleaning"
                checked={service === "Deep Cleaning"}
                onChange={(e) => {
                  clearBookingMessage();
                  setService(e.target.value);
                }}
              />
              Deep Cleaning
            </label>

            <label style={optionBoxStyle}>
              <input
                type="radio"
                value="Office Cleaning"
                checked={service === "Office Cleaning"}
                onChange={(e) => {
                  clearBookingMessage();
                  setService(e.target.value);
                }}
              />
              Office Cleaning
            </label>

           <label style={optionBoxStyle}>
             <input
               type="radio"
               value="Sofa Set Cleaning"
               checked={service === "Sofa Set Cleaning"}
               onChange={(e) => {
                 clearBookingMessage();
                 setService(e.target.value);
                setRoomSize("");
                setCarpetType("");
              }}
            />
            Sofa Set Cleaning
          </label>

          <label style={optionBoxStyle}>
            <input
              type="radio"
              value="Carpet Cleaning"
              checked={service === "Carpet Cleaning"}
              onChange={(e) => {
                clearBookingMessage();
                setService(e.target.value);
                setRoomSize("");
                setCarpetType("");
              }}
            />
            Carpet Cleaning
          </label>

          <label style={optionBoxStyle}>
            <input
              type="radio"
              value="Mobile Car Washing"
              checked={service === "Mobile Car Washing"}
              onChange={(e) => {
                clearBookingMessage();
                setService(e.target.value);
                setRoomSize("");
                setCarpetType("");
              }}
            />
            🚗 Mobile Car Washing
          </label>

            <label style={optionBoxStyle}>
              <input
                type="radio"
                value="Other"
                checked={service === "Other"}
                onChange={(e) => {
                  clearBookingMessage();
                  setService(e.target.value);
                }}
              />
              Other
            </label>

            {service === "Other" && (
              <div style={{ marginTop: "14px" }}>
                <input
                  type="text"
                  placeholder="Enter service type"
                  value={customService}
                  onChange={(e) => {
                    clearBookingMessage();
                    setCustomService(e.target.value);
                  }}
                  style={inputStyle}
                />

                <input
                  type="number"
                  placeholder="Enter service price"
                  value={customPrice}
                  onChange={(e) => {
                    clearBookingMessage();
                    setCustomPrice(e.target.value);
                  }}
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          {needsRoomSelection && (
  <div>
    {service === "House Cleaning" ||
    service === "Deep Cleaning" ||
    service === "Office Cleaning" ? (
      <>
        <p style={sectionTitleStyle}>Select Rooms</p>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="1-2"
            checked={roomSize === "1-2"}
            onChange={(e) => {
              clearBookingMessage();
              setRoomSize(e.target.value);
            }}
          />
          1-2 Rooms
        </label>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="3-4"
            checked={roomSize === "3-4"}
            onChange={(e) => {
              clearBookingMessage();
              setRoomSize(e.target.value);
            }}
          />
          3-4 Rooms
        </label>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="5-6"
            checked={roomSize === "5-6"}
            onChange={(e) => {
              clearBookingMessage();
              setRoomSize(e.target.value);
            }}
          />
          5-6 Rooms
        </label>
      </>
    ) : service === "Sofa Set Cleaning" ? (
      <>
        <p style={sectionTitleStyle}>Select Sofa Set</p>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="3-seater"
            checked={roomSize === "3-seater"}
            onChange={(e) => {
              clearBookingMessage();
              setRoomSize(e.target.value);
            }}
          />
          3-Seater — {formatManagedPrice("Sofa Set Cleaning (3-seater)")}
        </label>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="4-seater"
            checked={roomSize === "4-seater"}
            onChange={(e) => {
              clearBookingMessage();
              setRoomSize(e.target.value);
            }}
          />
          4-Seater — {formatManagedPrice("Sofa Set Cleaning (4-seater)")}
        </label>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="5-seater"
            checked={roomSize === "5-seater"}
            onChange={(e) => {
              clearBookingMessage();
              setRoomSize(e.target.value);
            }}
          />
          5-Seater — {formatManagedPrice("Sofa Set Cleaning (5-seater)")}
        </label>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="6-seater"
            checked={roomSize === "6-seater"}
            onChange={(e) => {
              clearBookingMessage();
              setRoomSize(e.target.value);
            }}
          />
          6-Seater — {formatManagedPrice("Sofa Set Cleaning (6-seater)")}
        </label>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="7-seater"
            checked={roomSize === "7-seater"}
            onChange={(e) => {
              clearBookingMessage();
              setRoomSize(e.target.value);
            }}
          />
          7-Seater — {formatManagedPrice("Sofa Set Cleaning (7-seater)")}
        </label>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="L-shaped"
            checked={roomSize === "L-shaped"}
            onChange={(e) => {
              clearBookingMessage();
              setRoomSize(e.target.value);
            }}
          />
          L-Shaped — {formatManagedPrice("Sofa Set Cleaning (L-shaped)")}
        </label>
      </>
    ) : service === "Carpet Cleaning" ? (
      <>
        <p style={sectionTitleStyle}>Select Carpet Size</p>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="Small"
            checked={roomSize === "Small"}
            onChange={(e) => {
              clearBookingMessage();
              setRoomSize(e.target.value);
            }}
          />
          Small
        </label>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="Medium"
            checked={roomSize === "Medium"}
            onChange={(e) => {
              clearBookingMessage();
              setRoomSize(e.target.value);
            }}
          />
          Medium
        </label>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="Large"
            checked={roomSize === "Large"}
            onChange={(e) => {
              clearBookingMessage();
              setRoomSize(e.target.value);
            }}
          />
          Large
        </label>

        <p style={sectionTitleStyle}>Select Carpet Type</p>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="Standard"
            checked={carpetType === "Standard"}
            onChange={(e) => {
              clearBookingMessage();
              setCarpetType(e.target.value);
            }}
          />
          Standard Carpet
        </label>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="Shaggy / High-Pile"
            checked={carpetType === "Shaggy / High-Pile"}
            onChange={(e) => {
              clearBookingMessage();
              setCarpetType(e.target.value);
            }}
          />
          Shaggy / High-Pile
        </label>
      </>
    ) : (
      <>
        <p style={sectionTitleStyle}>Select Vehicle Type</p>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="Small/Medium Car"
            checked={roomSize === "Small/Medium Car"}
            onChange={(e) => {
              clearBookingMessage();
              setRoomSize(e.target.value);
            }}
          />
          Small/Medium Car — {formatManagedPrice("Mobile Car Washing (Small/Medium Car)")}
        </label>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="SUV/Pickup"
            checked={roomSize === "SUV/Pickup"}
            onChange={(e) => {
              clearBookingMessage();
              setRoomSize(e.target.value);
            }}
          />
          SUV/Pickup — {formatManagedPrice("Mobile Car Washing (SUV/Pickup)")}
        </label>

        <label style={optionBoxStyle}>
          <input
            type="radio"
            value="Large SUV/Van"
            checked={roomSize === "Large SUV/Van"}
            onChange={(e) => {
              clearBookingMessage();
              setRoomSize(e.target.value);
            }}
          />
          Large SUV/Van — {formatManagedPrice("Mobile Car Washing (Large SUV/Van)")}
        </label>

        <div style={{ ...gpsBoxStyle, marginTop: "14px" }}>
          <p style={{ margin: 0, color: "#155e75", fontSize: "14px", lineHeight: "1.6" }}>
            🚗 Home car washing: customer provides access to water and a suitable washing area.
            Price covers a standard wash; engine washing, seat shampooing, polishing, and full
            detailing are not included.
          </p>
        </div>
      </>
    )}

    {service === "Deep Cleaning" && (
  <div style={{ marginTop: "22px" }}>
    <p style={sectionTitleStyle}>Optional Deep Cleaning Add-ons</p>

    <p
      style={{
        marginTop: "-4px",
        marginBottom: "14px",
        color: "#64748b",
        fontSize: "14px",
        lineHeight: "1.6",
      }}
    >
      Select only the extra work you need. Standard deep cleaning is already
      included in your normal service price.
    </p>

    {addonsLoading && (
      <div
        style={{
          padding: "12px 14px",
          borderRadius: "12px",
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          color: "#1d4ed8",
          fontSize: "14px",
          fontWeight: "700",
          marginBottom: "12px",
        }}
      >
        Loading available add-ons...
      </div>
    )}

    {addonsError && (
      <div
        style={{
          padding: "12px 14px",
          borderRadius: "12px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#991b1b",
          fontSize: "14px",
          fontWeight: "700",
          marginBottom: "12px",
        }}
      >
        {addonsError}
      </div>
    )}

    {!addonsLoading &&
      !addonsError &&
      serviceAddons.map((addon) => (
        <label
          key={addon.addon_code}
          style={{
            ...optionBoxStyle,
            alignItems: "flex-start",
          }}
        >
          <input
            type="checkbox"
            checked={selectedAddons.includes(addon.addon_code)}
            onChange={() => toggleAddon(addon.addon_code)}
            style={{ marginTop: "3px" }}
          />

          <span style={{ flex: 1 }}>
            <span
              style={{
                display: "block",
                fontWeight: "700",
                color: "#0f172a",
              }}
            >
              {addon.addon_name}
            </span>

            <span
              style={{
                display: "block",
                marginTop: "4px",
                color: addon.requires_assessment ? "#b45309" : "#475569",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            >
              {addon.requires_assessment
                ? "Price confirmed by Nyumbaklin after assessment."
                : `+ UGX ${Number(addon.price).toLocaleString()}`}
            </span>
          </span>
        </label>
      ))}

    {selectedAddons.includes("inside_refrigerator") &&
      selectedAddons.includes("inside_oven") &&
      selectedAddons.includes("inside_kitchen_cabinets") && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "12px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
            fontSize: "14px",
            fontWeight: "700",
            marginTop: "6px",
          }}
        >
          Bundle price applied: all 3 fixed add-ons for UGX 25,000.
        </div>
      )}
  </div>
)}

    <div style={priceBoxStyle}>
      <p
        style={{
          margin: 0,
          color: "#1d4ed8",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
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
        UGX {getEstimatedTotalPrice().toLocaleString()}
      </p>
    </div>
  </div>
)}
     

          <div>
            <p style={sectionTitleStyle}>Select Area</p>

            <button
              type="button"
              style={gpsButtonStyle}
              onClick={handleUseCurrentLocation}
              disabled={gettingLocation}
            >
              {gettingLocation ? "Getting Location..." : "📍 Use My Current Location"}
            </button>

            {locationMessage && (
              <div style={gpsBoxStyle}>
                <p
                  style={{
                    margin: 0,
                    color: "#155e75",
                    fontSize: "14px",
                    fontWeight: "600",
                    lineHeight: "1.6",
                  }}
                >
                  {locationMessage}
                </p>

                {gpsAccuracy && (
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      color: "#164e63",
                      fontSize: "13px",
                      lineHeight: "1.6",
                    }}
                  >
                    Accuracy: about {gpsAccuracy} meters
                  </p>
                )}

                {gpsTimestamp && (
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      color: "#164e63",
                      fontSize: "13px",
                      lineHeight: "1.6",
                    }}
                  >
                    Captured: {gpsTimestamp}
                  </p>
                )}

                {gpsReadableLocation && (
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      color: "#164e63",
                      fontSize: "13px",
                      lineHeight: "1.6",
                    }}
                  >
                    Approx area: {gpsReadableLocation}
                  </p>
                )}
              </div>
            )}

            {!gettingLocation && customArea.startsWith("GPS:") && !gpsReadableLocation && (
              <p
                style={{
                  margin: "4px 0 0 0",
                  color: "#164e63",
                  fontSize: "13px",
                  lineHeight: "1.6",
                }}
              >
                Approx area: not available yet. You can still continue with the GPS coordinates
                or edit the location manually.
              </p>
            )}

            <select
              value={area}
              onChange={(e) => {
                clearBookingMessage();

                const selectedArea = e.target.value;
                setArea(selectedArea);

                if (selectedArea !== "Other") {
                  setCustomArea("");
                  setLocationMessage("");
                  setGpsAccuracy(null);
                  setGpsTimestamp("");
                  setGpsReadableLocation("");
                }
              }}
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
                placeholder="Enter your area, landmark, or GPS location"
                value={customArea}
                onChange={(e) => {
                  clearBookingMessage();
                  setCustomArea(e.target.value);
                }}
                style={inputStyle}
              />
            )}
          </div>

          <div>
            <p style={sectionTitleStyle}>Select Date</p>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                clearBookingMessage();
                setDate(e.target.value);
              }}
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
                onChange={(e) => {
                  clearBookingMessage();
                  setPaymentMethod(e.target.value);
                }}
              />
              Pay After Service
            </label>

            <label style={optionBoxStyle}>
              <input
                type="radio"
                value="manual_mobile_money"
                checked={paymentMethod === "manual_mobile_money"}
                onChange={(e) => {
                  clearBookingMessage();
                  setPaymentMethod(e.target.value);
                }}
              />
              Pay Now with Mobile Money
            </label>

            {paymentMethod === "manual_mobile_money" && (
              <div style={momoBoxStyle}>
                <p
                  style={{
                    margin: "0 0 10px 0",
                    color: "#9a3412",
                    fontSize: "16px",
                    fontWeight: "800",
                  }}
                >
                  📲 Pay Now
                </p>

                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #fed7aa",
                    borderRadius: "12px",
                    padding: "12px",
                    marginBottom: "10px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      color: "#0f172a",
                      fontSize: "16px",
                      fontWeight: "800",
                    }}
                  >
                    MTN: 0765256406
                  </p>

                  <p
                    style={{
                      margin: 0,
                      color: "#0f172a",
                      fontSize: "16px",
                      fontWeight: "800",
                    }}
                  >
                    Airtel Merchant Code: 7076122
                  </p>
                </div>

                <p style={{ margin: "0", color: "#7c2d12", fontSize: "14px", lineHeight: "1.6" }}>
                  After paying, tap <strong>Book Service</strong>. Then open{" "}
                  <strong>My Bookings</strong> and submit your transaction ID.
                </p>

                <p
                  style={{
                    margin: "10px 0 0 0",
                    color: "#b91c1c",
                    fontSize: "13px",
                    fontWeight: "700",
                    lineHeight: "1.6",
                  }}
                >
                  Admin confirms after checking the real MTN/Airtel payment.
                </p>
              </div>
            )}

            <p style={noteStyle}>Pay after service is available if you prefer to pay later.</p>

            <p style={noteStyle}>Prices include cleaner transport within Kampala.</p>

            <p style={noteStyle}>
              Customer provides cleaning materials unless agreed otherwise.
            </p>
          </div>

          <button
            type="submit"
            style={buttonStyle}
            disabled={isSubmitting || (service !== "Other" && pricesLoading)}
          >
            {isSubmitting ? "Booking..." : "Book Service"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CustomerBooking;