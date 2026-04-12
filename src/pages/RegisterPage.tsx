import React, { useState } from "react";
import { auth, db } from "../firebase"; // Make sure db is imported
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "../styles/RegisterPage.css";

/* ── Eye icons ── */
const EyeOpenIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="m6.72 6.72A3 3 0 1 0 9.88 9.88" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

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

/* ── Main component ── */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName]               = useState("");
  const [username, setUsername]               = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [strength, setStrength]               = useState(0);

  const calcStrength = (val: string) => {
    if (!val) { setStrength(0); return; }
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val) && /[@$!%*?&]/.test(val)) score++;
    setStrength(score);
  };

  const strengthLabel = ["", "Weak", "Medium", "Strong"][strength];
  const strengthClass = ["", "weak", "medium", "strong"][strength];

  const validatePassword = (pass: string) =>
    /^(?=.*[a-zA-Z])(?=.*[\d@$!%*?&]).{8,}$/.test(pass);

  const isFormValid =
    fullName.trim() !== "" &&
    username.trim() !== "" &&
    email.trim()    !== "" &&
    password.length  >= 8  &&
    confirmPassword.length >= 1;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      toast.error("Password must be 8+ characters with a letter and a number or symbol.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      
      // 1. Update Firebase Auth Profile
      await updateProfile(userCred.user, { displayName: fullName });

      // 2. Save profile details directly to Firestore so the Dashboard can read them
      await setDoc(doc(db, 'users', userCred.user.uid, 'profile', 'info'), {
        fullName: fullName,
        username: username,
        email: email,
        birthdate: '' // Initialize with empty string for the settings page
      });

      toast.success("Registration successful!");
      setFullName(""); setUsername(""); setEmail("");
      setPassword(""); setConfirmPassword("");
      navigate("/login");
    } catch (error: any) {
      const messages: Record<string, string> = {
        "auth/email-already-in-use": "Email already in use.",
        "auth/weak-password":        "Password too weak.",
      };
      toast.error(messages[error.code] ?? "Registration failed. Please try again.");
    }
  };

  /* ── Inline SVG icons ── */
  const UserIcon  = <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
  const IdIcon    = <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 8h.01M11 8h6M7 12h.01M11 12h4"/></svg>;
  const EmailIcon = <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>;
  const LockIcon  = <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
  const ShieldIcon = <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

  return (
    <div className="register-container">

      {/* ── Left decorative panel ── */}
      
      {/* ── Right form panel ── */}
      <div className="register-right">
        <div className="form-wrapper">

          {/* Brand */}
          <div className="brand">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="brand-name">CashTrail</span>
          </div>

          <h2>Create your account</h2>
          <p className="form-subtitle">Join thousands of users today — it's free</p>

          <form onSubmit={handleRegister}>
            <div className="form-grid">

              {/* Full Name */}
              <div className="field-group">
                <label>Full Name</label>
                <InputRow icon={UserIcon}>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </InputRow>
              </div>

              {/* Username */}
              <div className="field-group">
                <label>Username</label>
                <InputRow icon={IdIcon}>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </InputRow>
              </div>

              {/* Email */}
              <div className="field-group full-width">
                <label>Email Address</label>
                <InputRow icon={EmailIcon}>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </InputRow>
              </div>

              <div className="section-divider" />

              {/* Password */}
              <div className="field-group">
                <label>Password</label>
                <InputRow icon={LockIcon}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); calcStrength(e.target.value); }}
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOffIcon /> : <EyeOpenIcon />}
                  </button>
                </InputRow>
                {password && (
                  <div className="strength-row">
                    <div className={`strength-bar ${strength >= 1 ? strengthClass : ""}`} />
                    <div className={`strength-bar ${strength >= 2 ? strengthClass : ""}`} />
                    <div className={`strength-bar ${strength >= 3 ? strengthClass : ""}`} />
                    <span className={`strength-label ${strengthClass}`}>{strengthLabel}</span>
                  </div>
                )}
                <p className="password-hint">
                  Min <b>8 characters</b> · at least <b>1 letter</b> · <b>1 number</b> or symbol <b>(@ $ ! % * ? &amp;)</b>
                </p>
              </div>

              {/* Confirm Password */}
              <div className="field-group">
                <label>Confirm Password</label>
                <InputRow icon={ShieldIcon}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOffIcon /> : <EyeOpenIcon />}
                  </button>
                </InputRow>
              </div>

              {/* Submit */}
              <button type="submit" className="btn-primary" disabled={!isFormValid}>
                Create Account →
              </button>

            </div>
          </form>

          <p className="login-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Sign in</span>
          </p>

        </div>
      </div>

    </div>
  );
};

export default RegisterPage;