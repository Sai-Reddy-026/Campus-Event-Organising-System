import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student"); 
  const [rollNumber, setRollNumber] = useState(""); 
  const [employeeId, setEmployeeId] = useState(""); 
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true); 
    try {
      // We send EVERYTHING. The backend logic we wrote will pick what it needs.
      const res = await axios.post("http://127.0.0.1:5000/api/auth/register", { 
        fullname, 
        email, 
        username, 
        password, 
        role,
        rollNumber, // Send even if empty; backend handles it
        employeeId  // Send even if empty; backend handles it
      });

      alert(res.data.message || "Registration successful!");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err.response?.data);
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <>
      <div className="background">
        {[...Array(8)].map((_, i) => <span key={i}></span>)}
      </div>

      <div className="register-box">
        <h2>Register</h2>

        {/* Side-by-side Role selection */}
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

        <form onSubmit={handleRegister}>
          <div className="input-box">
            <input type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} required placeholder=" " />
            <label>Full Name</label>
          </div>

          <div className="input-box">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder=" " />
            <label>Email</label>
          </div>

          {/* Conditional field based on role */}
          {role === "student" ? (
            <div className="input-box">
              <input type="text" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} required placeholder=" " />
              <label>Roll Number</label>
            </div>
          ) : (
            <div className="input-box">
              <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required placeholder=" " />
              <label>Employee ID</label>
            </div>
          )}

          <div className="input-box">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder=" " />
            <label>Username</label>
          </div>

          <div className="input-box">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder=" " />
            <label>Password</label>
          </div>

          <div className="input-box">
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder=" " />
            <label>Confirm Password</label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </>
  );
}

export default Register;