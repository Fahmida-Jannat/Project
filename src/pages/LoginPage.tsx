import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { auth } from '../firebase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) navigate('/dashboard');
    });
    return () => unsubscribe();
  }, [navigate]);

  // Email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
    setLoading(false);
  };

  // Google login
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Logged in with Google!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
    }
  };

  // Password reset
  const handlePasswordReset = async () => {
    const resetEmail = prompt('Enter your registered email:');
    if (!resetEmail) return;

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="login-container">
      <div className="glass-card">
        <h3 className="welcome-text">Welcome Back</h3>
        <h1 className="app-title">CashTrail</h1>
        <p className="subtitle">Login to your account</p>

        <form onSubmit={handleLogin} className="login-form">
          {/* Email input */}
          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password input with show/hide */}
          <div className="input-box password-box">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <img src="/icons/eye-off.png" alt="Hide" />
              ) : (
                <img src="/icons/eye.png" alt="Show" />
              )}
            </span>
          </div>

          {/* Options */}
          <div className="options-row">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember Me
            </label>
            <span className="forgot" onClick={handlePasswordReset}>
              Forgot Password?
            </span>
          </div>

          {/* Login button */}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p style={{ margin: '15px 0', textAlign: 'center', fontWeight: 500 }}>
          or
        </p>

        {/* Google login icon */}
        <div className="google-icon-box">
          <button onClick={handleGoogleLogin} className="google-icon-btn">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
              alt="Google"
            />
          </button>
        </div>

        {/* Register link */}
        <p className="login-link">
          Don’t have an account?{' '}
          <span onClick={() => navigate('/register')}>Register</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;