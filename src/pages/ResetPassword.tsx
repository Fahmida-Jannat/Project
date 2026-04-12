import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import toast from "react-hot-toast";
import "../styles/LoginPage.css"; 

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

  // Get the secret code from the URL that Firebase sent
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    if (!oobCode) {
      toast.error("Invalid or missing reset code.");
      return;
    }

    // Verify the code is valid and hasn't expired
    verifyPasswordResetCode(auth, oobCode)
      .then((userEmail) => {
        setEmail(userEmail);
        setValidCode(true);
      })
      .catch(() => {
        toast.error("Invalid or expired reset link. Please try again.");
      });
  }, [oobCode]);

  // Password strength indicator logic
  const checkPasswordStrength = (value: string) => {
    if (value.length < 8) {
      setPasswordStrength("Weak");
      return;
    }

    const hasLetter = value.match(/[a-zA-Z]/); // Lower OR Uppercase
    const hasNumber = value.match(/[0-9]/);    // Number
    const hasSpecial = value.match(/[@$!%*?&#^_\-+=]/); // Special Character

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

  // Strong password validation
  const validatePassword = (pass: string) => {
    const strongPassword = /^(?=.*[a-zA-Z])(?=.*[0-9@$!%*?&#^_\-+=]).{8,}$/;
    return strongPassword.test(pass);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(newPassword)) {
      toast.error(
        "Password must be at least 8 characters and contain a letter, plus a number or special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!oobCode) return;

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast.success("Password changed successfully! You can now log in.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!validCode) {
    return (
      <div className="login-container">
        <div className="glass-card">
          <h1 className="app-title">CashTrail</h1>
          <p style={{ marginTop: "20px" }}>Verifying reset link...</p>
          <button 
            className="btn-primary" 
            style={{ marginTop: "20px" }} 
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="glass-card">
        <h3 className="welcome-text">Reset Password</h3>
        <h1 className="app-title">CashTrail</h1>
        <p className="subtitle">Set a new password for {email}</p>

        <form onSubmit={handleResetPassword} className="login-form">
          {/* New Password */}
          <div className="input-box password-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => {
                const val = e.target.value;
                setNewPassword(val);
                checkPasswordStrength(val);
              }}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              <img src={showPassword ? "/icons/eye-off.png" : "/icons/eye.png"} alt="Toggle" />
            </span>
          </div>

          {/* Password Strength Indicator */}
          {newPassword && (
            <p className={`password-strength ${passwordStrength.toLowerCase()}`}>
              Strength: {passwordStrength}
            </p>
          )}

          {/* Confirm Password */}
          <div className="input-box password-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save New Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;