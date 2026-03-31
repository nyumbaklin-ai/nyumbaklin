import { useEffect, useState } from "react";

function CleanerMyJobs() {
  const [jobs, setJobs] = useState([]);
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/cleaner/my-cleaner-jobs`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      console.log("MY JOBS RESPONSE STATUS:", response.status);
      console.log("MY JOBS RESPONSE DATA:", data);

      if (!response.ok) {
        alert(data.message || "Failed to fetch jobs");
        setJobs([]);
        return;
      }

      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch jobs error:", err);
      alert("Failed to connect to backend");
      setJobs([]);
    }
  };

  useEffect(() => {
    fetchJobs();

    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const startJob = async (id) => {
    try {
      const response = await fetch(`${API_URL}/cleaner/start-job/${id}`, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const message = await response.text();
      alert(message);
      fetchJobs();
    } catch (error) {
      console.error(error);
      alert("Failed to start job");
    }
  };

  const completeJob = async (id) => {
    try {
      const response = await fetch(`${API_URL}/cleaner/complete-job/${id}`, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const message = await response.text();
      alert(message);
      fetchJobs();
    } catch (error) {
      console.error(error);
      alert("Failed to complete job");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>My Jobs</h1>

      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Service</th>
            <th>Price</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan="6">No jobs yet</td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.id}</td>
                <td>{job.email}</td>
                <td>{job.service}</td>
                <td>UGX {Number(job.price).toLocaleString()}</td>

                <td>
                  {job.status === "accepted" && (
                    <span style={{ color: "blue" }}>🔵 Accepted</span>
                  )}

                  {job.status === "in progress" && (
                    <span style={{ color: "orange" }}>🟠 In Progress</span>
                  )}

                  {job.status === "completed" && (
                    <span style={{ color: "green" }}>🟢 Completed</span>
                  )}
                </td>

                <td>
                  {job.status === "accepted" && (
                    <button
                      onClick={() => startJob(job.id)}
                      style={{ background: "blue", color: "white", padding: "5px" }}
                    >
                      Start Job
                    </button>
                  )}

                  {job.status === "in progress" && (
                    <button
                      onClick={() => completeJob(job.id)}
                      style={{ background: "green", color: "white", padding: "5px" }}
                    >
                      Complete Job
                    </button>
                  )}

                  {job.status === "completed" && <span>✔ Done</span>}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CleanerMyJobs;