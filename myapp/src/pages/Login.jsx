import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate(); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); 

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:5000/api/auth/login", { 
        username, 
        password,
        role 
      });

      if (res.status === 200) {
        alert(`${role.charAt(0).toUpperCase() + role.slice(1)} login successful!`);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        // Redirect based on the chosen role
        if (role === "faculty") {
          navigate("/faculty-home");
        } else {
          navigate("/home");
        }
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data);
      alert(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <>
      <div className="background">
        {[...Array(8)].map((_, i) => (
          <span key={i}></span>
        ))}
      </div>

      <div className="login-box">
        <h2>Login</h2>

        {/* SIDE-BY-SIDE ROLE SELECTION */}
        <div className="role-container">
          <div 
            className={`role-card ${role === "student" ? "active" : ""}`} 
            onClick={() => setRole("student")}
          >
            Student
          </div>
          <div 
            className={`role-card ${role === "faculty" ? "active" : ""}`} 
            onClick={() => setRole("faculty")}
          >
            Faculty
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-box">
            <input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              placeholder=" " 
            />
            <label>Username</label>
          </div>

          <div className="input-box">
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder=" " 
            />
            <label>Password</label>
          </div>

          <button type="submit">Login</button>
        </form>

        <p className="register">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </>
  );
}

export default Login;