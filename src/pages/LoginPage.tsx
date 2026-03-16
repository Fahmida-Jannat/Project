import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User,
} from "firebase/auth";
import { auth } from "../firebase";
import { NotificationFacade } from "../components/NotificationFacade";

import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // State for our custom Forgot Password Modal
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>("");

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) navigate("/dashboard");
    });
    return () => unsubscribe();
  }, [navigate]);

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (rememberMe) {
        await setPersistence(auth, browserLocalPersistence);
      } else {
        await setPersistence(auth, browserSessionPersistence);
      }
      await signInWithEmailAndPassword(auth, email, password);
      NotificationFacade.success("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      // Handle specific Firebase login errors
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-email" ||
        error.code === "auth/invalid-credential"
      ) {
        // 'invalid-credential' is the new standard error for both wrong email and wrong password to prevent email enumeration attacks,
        // but we can tailor the message if needed.
        NotificationFacade.error("Invalid email or password does not match.");
      } else if (error.code === "auth/wrong-password") {
        NotificationFacade.error("Password does not match.");
      } else {
        NotificationFacade.error(error.message || "Login failed");
      }
    }

    setLoading(false);
  };

  // Google Login
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      NotificationFacade.success("Logged in with Google!");
      navigate("/dashboard");
    } catch (error: any) {
      NotificationFacade.error(error.message || "Google login failed");
    }
  };

  // Reset Password using the custom modal
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      NotificationFacade.error("Please enter your email");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      NotificationFacade.success("A reset link has been sent to your email!");
      setShowResetModal(false); // Close modal on success
      setResetEmail(""); // Clear the input
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        NotificationFacade.error("Email does not exist.");
      } else {
        NotificationFacade.error(error.message || "Failed to send reset email");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="glass-card">
        <h3 className="welcome-text">Welcome Back</h3>
        <h1 className="app-title">CashTrail</h1>
        <p className="subtitle">Login to your account</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-box password-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              <img
                src={showPassword ? "/icons/eye-off.png" : "/icons/eye.png"}
                alt="Toggle Visibility"
              />
            </span>
          </div>

          <div className="options-row">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember Me
            </label>

            <span className="forgot" onClick={() => setShowResetModal(true)}>
              Forgot Password?
            </span>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p style={{ margin: "15px 0", textAlign: "center", fontWeight: 500 }}>
          or
        </p>

        <div className="google-icon-box">
          <button onClick={handleGoogleLogin} className="google-icon-btn">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
              alt="Google"
            />
          </button>
        </div>

        <p className="login-link">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>

      {/* --- CUSTOM MODAL FOR FORGOT PASSWORD --- */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h2>Reset Password</h2>
            <p>Enter your registered email to receive a password reset link.</p>
            <form onSubmit={handlePasswordReset}>
              <div className="input-box">
                <input
                  type="email"
                  placeholder="Your Email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Send Link
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowResetModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;