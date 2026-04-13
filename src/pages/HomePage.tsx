import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo-text">CASHTRAIL</div>
        <div className="nav-actions">
          <button onClick={() => navigate("/login")} className="login-link">Login</button>
          <button onClick={() => navigate("/register")} className="btn-primary">Create Account</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <span className="hero-tagline">Financial Intelligence Reimagined</span>
          <h1>Master Your Money <br /> <span className="text-gradient">With Every Transaction</span></h1>
          <p className="hero-description">
            Experience a seamless way to track income, manage multi-category budgets, 
            and visualize your financial health through advanced data analytics.
          </p>
          <div className="hero-cta-group">
            <button onClick={() => navigate("/register")} className="btn-large">Start Tracking For Free</button>
            <button onClick={() => navigate("/login")} className="btn-outline">Explore Dashboard</button>
          </div>
        </div>

        {/* Abstract Preview of Dashboard Elements */}
        <div className="hero-visual">
          <div className="floating-card balance-card">
            <span className="card-label">Total Balance</span>
            <span className="card-value">৳ 2,53,850</span>
          </div>
          <div className="floating-card alert-card">
            <span className="alert-status">Budget Exceeded</span>
            <span className="alert-detail">You overspent on food by ৳ 600</span>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-title">
          <h2>Everything You Need to Scale Your Savings</h2>
        </div>
        
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-line"></div>
            <h3>Spending Analysis</h3>
            <p>Switch between Pie, Bar, and Line charts to understand exactly where your money flows each month.</p>
          </div>

          <div className="feature-item">
            <div className="feature-line"></div>
            <h3>Smart Budgeting</h3>
            <p>Set specific limits for categories like Rent, Shopping, and Food. Receive instant alerts before you overspend.</p>
          </div>

          <div className="feature-item">
            <div className="feature-line"></div>
            <h3>Quick Add Interface</h3>
            <p>Our streamlined entry system allows you to log income or expenses in under three seconds.</p>
          </div>

          <div className="feature-item">
            <div className="feature-line"></div>
            <h3>Financial Goals</h3>
            <p>Define long-term savings objectives and watch your progress update in real-time as you save.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <p>© 2026 CashTrail Financial Systems</p>
          <div className="footer-links">
            {/* Added actual link tags for functionality */}
            <a href="#privacy" className="footer-link">Privacy Policy</a>
            <a href="mailto:support@cashtrail.com" className="footer-link">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;