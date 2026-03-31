import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function CustomerMyBookings() {
  const [bookings, setBookings] = useState([]);
  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/customers/my-bookings`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    }
  };

  useEffect(() => {
    fetchBookings();

    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "600px",
        margin: "auto",
      }}
    >
      <h2 style={{ textAlign: "center" }}>My Bookings</h2>

      {bookings.length === 0 ? (
        <p style={{ textAlign: "center" }}>No bookings yet</p>
      ) : (
        bookings.map((b) => (
          <div
            key={b.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "15px",
              boxShadow: "0 0 5px rgba(0,0,0,0.1)",
            }}
          >
            <h3>{b.service}</h3>

            <p>
              <strong>Date:</strong>{" "}
              {new Date(b.booking_date).toLocaleDateString()}
            </p>

            <p>
              <strong>Price:</strong> UGX {Number(b.price).toLocaleString()}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {b.status === "pending" && (
                <span
                  style={{
                    background: "orange",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: "5px",
                  }}
                >
                  Pending
                </span>
              )}

              {b.status === "accepted" && (
                <span
                  style={{
                    background: "blue",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: "5px",
                  }}
                >
                  Accepted
                </span>
              )}

              {b.status === "in progress" && (
                <span
                  style={{
                    background: "purple",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: "5px",
                  }}
                >
                  In Progress
                </span>
              )}

              {b.status === "completed" && (
                <span
                  style={{
                    background: "green",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: "5px",
                  }}
                >
                  Completed
                </span>
              )}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default CustomerMyBookings;