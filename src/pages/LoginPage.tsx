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

/* ── Eye icons ── */
const EyeOpenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="m6.72 6.72A3 3 0 1 0 9.88 9.88" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ── Input icons ── */
const EmailIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>;
const LockIcon  = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

/* ── Reusable InputRow ── */
interface InputRowProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}
const InputRow: React.FC<InputRowProps> = ({ icon, children }) => (
  <div className="input-row">
    <span className="input-icon">{icon}</span>
    <span className="input-divider" />
    {children}
  </div>
);

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
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-email" ||
        error.code === "auth/invalid-credential"
      ) {
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
      setShowResetModal(false); 
      setResetEmail(""); 
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
          
          {/* Formatted Email Field */}
          <div className="field-group">
            <label style={{ display: 'block', textAlign: 'left', marginBottom: '8px', color: '#cfeeff', fontSize: '14px' }}>
              Email Address
            </label>
            <InputRow icon={EmailIcon}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputRow>
          </div>

          {/* Formatted Password Field */}
          <div className="field-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', textAlign: 'left', marginBottom: '8px', color: '#cfeeff', fontSize: '14px' }}>
              Password
            </label>
            <InputRow icon={LockIcon}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="eye-btn" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 10px', color: '#cfeeff' }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeOpenIcon />}
              </button>
            </InputRow>
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
              style={{ width: '20px', height: '20px' }}
            />
          </button>
        </div>

        <p className="login-link">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")} style={{ cursor: 'pointer', color: '#2EC4FF' }}>Register</span>
        </p>
      </div>

      {/* --- CUSTOM MODAL FOR FORGOT PASSWORD --- */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h2>Reset Password</h2>
            <p>Enter your registered email to receive a password reset link.</p>
            <form onSubmit={handlePasswordReset}>
              <div className="field-group" style={{ marginBottom: '20px' }}>
                <InputRow icon={EmailIcon}>
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </InputRow>
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