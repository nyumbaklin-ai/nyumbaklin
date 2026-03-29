import { useEffect, useState } from "react";

function CleanerEarnings() {

  const [earnings, setEarnings] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {

    fetch("http://localhost:5000/cleaner/earnings", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => {
        setEarnings(data);
      })
      .catch(error => {
        console.error("Error fetching earnings:", error);
      });

  }, [token]);

  return (

    <div style={{padding:"40px"}}>

      <h1>Cleaner Earnings</h1>

      {earnings ? (

        <div>

          <h3>Total Completed Jobs: {earnings.total_jobs}</h3>

          <h3>
            Total Money Earned: UGX {Number(earnings.total_earnings).toLocaleString()}
          </h3>

        </div>

      ) : (

        <p>Loading earnings...</p>

      )}

    </div>

  );
}

export default CleanerEarnings;