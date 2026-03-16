import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { NotificationFacade } from "../components/NotificationFacade";
import { useNavigate } from "react-router-dom";
import "../styles/RegisterPage.css";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState("");

  // Strong password validation
  const validatePassword = (pass: string) => {
    const strongPassword =
      /^(?=.*[a-zA-Z])(?=.*[\d@$!%*?&]).{8,}$/;

    return strongPassword.test(pass);
  };

  // Password strength checker
  const checkStrength = (value: string) => {
    if (value.length < 6) setPasswordStrength("Weak");
    else if (value.match(/[A-Z]/) && value.match(/[0-9]/))
      setPasswordStrength("Medium");
    else if (
      value.match(/[A-Z]/) &&
      value.match(/[a-z]/) &&
      value.match(/[0-9]/) &&
      value.match(/[@$!%*?&]/)
    )
      setPasswordStrength("Strong");
    else setPasswordStrength("Weak");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      NotificationFacade.error(
        "Password must contain 8+ characters, uppercase or lowercase, number or special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      NotificationFacade.error("Passwords do not match");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCred.user, {
        displayName: `${fullName} (${userId})`,
      });

      NotificationFacade.success("Registration Successful");

      setFullName("");
      setUserId("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      navigate("/login");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        NotificationFacade.error("Email already exists");
      } else if (error.code === "auth/weak-password") {
        NotificationFacade.error("Password too weak");
      } else {
        NotificationFacade.error("Registration failed");
      }
    }
  };

  return (
    <div className="register-container">
      <div className="glass-card">
        <h2>Create Account</h2>

        <form onSubmit={handleRegister}>
          <div className="form-grid">

            {/* Full Name */}
            <div className="input-box">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* User ID */}
            <div className="input-box">
              <input
                type="text"
                placeholder="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="input-box">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="input-box password-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  checkStrength(value);
                }}
                required
              />

              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <img
                  src={showPassword ? "/icons/eye-off.png" : "/icons/eye.png"}
                  alt="toggle"
                />
              </span>
            </div>

            {/* Password Strength */}
            {password && (
              <p className={`password-strength ${passwordStrength.toLowerCase()}`}>
                Strength: {passwordStrength}
              </p>
            )}

            {/* Confirm Password */}
            <div className="input-box full-width password-box">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <span
                className="toggle-password"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                <img
                  src={
                    showConfirmPassword
                      ? "/icons/eye-off.png"
                      : "/icons/eye.png"
                  }
                  alt="toggle"
                />
              </span>
            </div>

            {/* Register Button */}
            <div className="full-width">
              <button type="submit" className="btn-primary">
                Register
              </button>
            </div>

          </div>
        </form>

        <p className="login-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;