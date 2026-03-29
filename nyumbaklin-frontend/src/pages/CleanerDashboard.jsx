import { useEffect, useState } from "react";

function CleanerDashboard() {

  const [jobs, setJobs] = useState([]);
  const token = localStorage.getItem("token");

  const fetchJobs = () => {
    fetch("http://localhost:5000/cleaner/available-jobs", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => {
        setJobs(data);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const acceptJob = async (id) => {

    try {

      const response = await fetch(
        `http://localhost:5000/cleaner/accept-job/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      const message = await response.text();
      alert(message);

      fetchJobs();

    } catch (error) {
      console.error(error);
    }

  };

  return (
    <div style={{
      padding:"30px",
      maxWidth:"600px",
      margin:"auto"
    }}>

      <h2 style={{textAlign:"center"}}>Available Jobs</h2>

      {jobs.length === 0 ? (

        <p style={{textAlign:"center"}}>No jobs available</p>

      ) : (

        jobs.map(job => (

          <div key={job.id} style={{
            border:"1px solid #ddd",
            borderRadius:"10px",
            padding:"15px",
            marginBottom:"15px",
            boxShadow:"0 0 5px rgba(0,0,0,0.1)"
          }}>

            <h3>{job.service}</h3>

            <p><strong>Date:</strong> {new Date(job.booking_date).toLocaleDateString()}</p>

            <p><strong>Price:</strong> UGX {Number(job.price).toLocaleString()}</p>

            <button
              onClick={() => acceptJob(job.id)}
              style={{
                marginTop:"10px",
                padding:"8px 12px",
                background:"black",
                color:"white",
                border:"none",
                cursor:"pointer",
                borderRadius:"5px"
              }}
            >
              Accept Job
            </button>

          </div>

        ))

      )}

    </div>
  );
}

export default CleanerDashboard;