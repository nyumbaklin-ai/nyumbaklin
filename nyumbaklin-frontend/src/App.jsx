import { useState } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import CleanerDashboard from "./pages/CleanerDashboard";
import CleanerMyJobs from "./pages/CleanerMyJobs";
import CleanerEarnings from "./pages/CleanerEarnings";
import CustomerBooking from "./pages/CustomerBooking";
import CustomerMyBookings from "./pages/CustomerMyBookings";

function Login() {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try{

      const response = await fetch("http://localhost:5000/customers/login",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({email,password})
      });

      const data = await response.json();

      if(response.ok){

        localStorage.setItem("token",data.token);
        localStorage.setItem("role",data.role);

        if(data.role === "cleaner"){
          navigate("/cleaner/dashboard");
        }
        else if(data.role === "admin"){
          navigate("/dashboard");
        }
        else if(data.role === "customer"){
          navigate("/book-service");
        }

      }else{
        alert(data.message || "Login failed");
      }

    }catch(error){
      console.error("Login error:", error);
    }

  };

  return(

    <div style={{padding:"40px"}}>

      <h2>Nyumbaklin Login</h2>

      <form onSubmit={handleLogin}>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <br/><br/>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />

        <br/><br/>

        <button type="submit">Login</button>

      </form>

    </div>

  );

}



// ✅ UPDATED PROTECTED ROUTE WITH ROLE
function ProtectedRoute({children, allowedRole}){

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if(!token){
    return <Navigate to="/" />;
  }

  if(allowedRole && role !== allowedRole){
    return <Navigate to="/" />;
  }

  return children;

}



function Dashboard(){
  return(
    <h1 style={{padding:"40px"}}>Admin Dashboard</h1>
  );
}



function Layout({ children }) {

  const location = useLocation();

  if (location.pathname === "/") {
    return children;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}



function App(){

  return(

    <Layout>

      <Routes>

        <Route path="/" element={<Login />} />

        {/* ADMIN */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <Dashboard/>
            </ProtectedRoute>
          }
        />

        {/* CLEANER */}
        <Route
          path="/cleaner/dashboard"
          element={
            <ProtectedRoute allowedRole="cleaner">
              <CleanerDashboard/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cleaner/my-jobs"
          element={
            <ProtectedRoute allowedRole="cleaner">
              <CleanerMyJobs/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cleaner/earnings"
          element={
            <ProtectedRoute allowedRole="cleaner">
              <CleanerEarnings/>
            </ProtectedRoute>
          }
        />

        {/* CUSTOMER */}
        <Route
          path="/book-service"
          element={
            <ProtectedRoute allowedRole="customer">
              <CustomerBooking/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute allowedRole="customer">
              <CustomerMyBookings/>
            </ProtectedRoute>
          }
        />

      </Routes>

    </Layout>

  );

}

export default App;