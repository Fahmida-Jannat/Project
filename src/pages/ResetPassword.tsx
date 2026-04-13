import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import toast from "react-hot-toast";
import "../styles/ResetPassword.css";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [validCode, setValidCode] = useState(false);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    if (!oobCode) {
      toast.error("Invalid or missing reset code.");
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then((userEmail) => {
        setEmail(userEmail);
        setValidCode(true);
      })
      .catch(() => {
        toast.error("Invalid or expired reset link. Please try again.");
      });
  }, [oobCode]);

  const checkPasswordStrength = (value: string) => {
    if (value.length === 0) {
      setPasswordStrength("");
      return;
    }
    if (value.length < 8) {
      setPasswordStrength("Weak");
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[@$!%*?&#^_\-+=]/.test(value);

    if (hasLetter && (hasNumber || hasSpecial)) {
      if ((hasNumber && hasSpecial) || value.length >= 12) {
        setPasswordStrength("Strong");
      } else {
        setPasswordStrength("Medium");
      }
    } else {
      setPasswordStrength("Weak");
    }
  };

  const validatePassword = (pass: string) => {
    const strongPassword = /^(?=.*[a-zA-Z])(?=.*[0-9@$!%*?&#^_\-+=]).{8,}$/;
    return strongPassword.test(pass);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(newPassword)) {
      toast.error("Password does not meet security requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      if (oobCode) {
        await confirmPasswordReset(auth, oobCode, newPassword);
        toast.success("Password updated! Please log in.");
        navigate("/login");
      }
    } catch (error: any) {
      toast.error(error.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!validCode) {
    return (
      <div className="reset-container">
        <div className="reset-right">
          <div className="form-wrapper">
            <h1 className="brand-name">CashTrail</h1>
            <p className="form-subtitle">Verifying your security link...</p>
            <button className="btn-primary" onClick={() => navigate("/login")}>
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-container">
      {/* Left Panel */}
      <div className="reset-left">
        <div className="left-content">
          <h2 className="left-tagline">Secure your <span>Future.</span></h2>
          <p className="left-desc">Choose a strong password to keep your financial data protected and private.</p>
          <div className="left-features">
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>End-to-end encryption</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>Real-time security alerts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="reset-right">
        <div className="form-wrapper">
          <div className="brand">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="brand-name">CashTrail</span>
          </div>

          <h2>New Password</h2>
          <p className="form-subtitle">Updating access for {email}</p>

          <form onSubmit={handleResetPassword} className="form-grid">
            <div className="field-group full-width">
              <label>New Password</label>
              <div className="input-row">
                <div className="input-icon">
                  <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>
                <div className="input-divider"></div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    checkPasswordStrength(e.target.value);
                  }}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  <svg viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Strength Indicator Bars */}
            <div className="field-group full-width">
              <div className="strength-row">
                <div className={`strength-bar ${passwordStrength.toLowerCase() === 'weak' || passwordStrength.toLowerCase() === 'medium' || passwordStrength.toLowerCase() === 'strong' ? passwordStrength.toLowerCase() : ''}`}></div>
                <div className={`strength-bar ${passwordStrength.toLowerCase() === 'medium' || passwordStrength.toLowerCase() === 'strong' ? passwordStrength.toLowerCase() : ''}`}></div>
                <div className={`strength-bar ${passwordStrength.toLowerCase() === 'strong' ? passwordStrength.toLowerCase() : ''}`}></div>
                <span className={`strength-label ${passwordStrength.toLowerCase()}`}>{passwordStrength}</span>
              </div>
            </div>

            <div className="field-group full-width">
              <label>Confirm Password</label>
              <div className="input-row">
                <div className="input-icon">
                  <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                <div className="input-divider"></div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Save New Password"}
            </button>
          </form>

          <div className="login-link">
            Remembered? <span onClick={() => navigate("/login")}>Back to login</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;