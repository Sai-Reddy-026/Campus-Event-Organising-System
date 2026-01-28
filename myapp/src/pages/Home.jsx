import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="home-wrapper">
      {/* --- SIDEBAR --- */}
      <aside className="sidebar">
        <h2>App Logo</h2>
        <div className="nav-links">
          <div 
            className={`nav-item ${view === "dashboard" ? "active" : ""}`} 
            onClick={() => setView("dashboard")}
          >
            Dashboard
          </div>
          <div 
            className={`nav-item ${view === "profile" ? "active" : ""}`} 
            onClick={() => setView("profile")}
          >
            Profile
          </div>
        </div>
        
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="dashboard-content">
        {view === "dashboard" ? (
          <div className="card">
            <h2>Hello, {user?.fullname}!</h2>
            <p>Welcome to your MERN dashboard.</p>
          </div>
        ) : (
          <div className="welcome-card">
            <h2>User Profile</h2>
            <hr style={{ borderColor: 'rgba(0,210,255,0.2)', margin: '20px 0' }} />
            <p><strong>Name:</strong> {user?.fullname}</p>
            <p><strong>Username:</strong> @{user?.username}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;