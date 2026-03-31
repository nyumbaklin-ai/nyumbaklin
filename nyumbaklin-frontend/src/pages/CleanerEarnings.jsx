import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function CleanerEarnings() {
  const [earnings, setEarnings] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await fetch(`${API_URL}/cleaner/earnings`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const data = await response.json();
        setEarnings(data);
      } catch (error) {
        console.error("Error fetching earnings:", error);
      }
    };

    fetchEarnings();
  }, [token]);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Cleaner Earnings</h1>

      {earnings ? (
        <div>
          <h3>Total Completed Jobs: {earnings.total_jobs}</h3>

          <h3>
            Total Money Earned: UGX{" "}
            {Number(earnings.total_earnings).toLocaleString()}
          </h3>
        </div>
      ) : (
        <p>Loading earnings...</p>
      )}
    </div>
  );
}

export default CleanerEarnings;