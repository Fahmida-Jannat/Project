import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">CashTrail</div>
        <div className="nav-right">
          <a href="mailto:support@cashtrail.com" className="email">support@cashtrail.com</a>
          <button onClick={() => navigate("/login")} className="nav-btn">Login</button>
          <button onClick={() => navigate("/register")} className="nav-btn primary">Register</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Welcome to CashTrail</h1>
          <p className="subtitle">Your Personal Expense Tracker</p>
          <p className="description">
            CashTrail helps you manage daily expenses, track spending habits,
            and stay financially organized. Simple, secure, and easy to use.
          </p>
          <button onClick={() => navigate("/register")} className="cta-btn">
            Get Started
          </button>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="features">
        <h2>Why Use CashTrail?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Track Expenses</h3>
            <p>Easily record daily income and expenses</p>
          </div>
          <div className="feature-card">
            <h3>Smart Dashboard</h3>
            <p>Visualize your finances with interactive charts</p>
          </div>
          <div className="feature-card">
            <h3>Secure Account</h3>
            <p>Your data is fully protected with secure authentication</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        © 2026 CashTrail
      </footer>
      
    </div>
  );
};

export default HomePage;