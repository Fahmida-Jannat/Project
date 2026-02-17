import React, { useState } from 'react';
import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import toast from 'react-hot-toast';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });

      toast.success("Account created successfully");

      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address.");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password must be at least 6 characters.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Google successfully");
    } catch {
      toast.error("Google sign-in failed.");
    }
  };

  return (
    <div className="register-container">
      <div className="glass-card">
        <div className="form-section">
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ 
              margin: 0,
              fontSize: '3rem',
              color: '#ffffff',
              fontFamily: "'Playfair Display', serif"
            }}>
              Welcome to
            </h1>

            <p style={{
              margin: '5px 0 0',
              fontSize: '1.3rem',
              color: '#f0c040',
              fontWeight: 700,
              fontFamily: "'Playfair Display', serif"
            }}>
              Cash Trail – A Personal Expense Tracker
            </p>
          </div>

          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit" style={{ display: 'none' }}></button>
          </form>
        </div>

        <div className="action-section">
          <button onClick={handleRegister} className="btn-primary">
            Sign Up
          </button>

          <p className="login-link">
            Already have an account? <span className="link-text">Log in</span>
          </p>

          <div className="divider">Or</div>

          <button onClick={handleGoogleSignIn} className="btn-social">
            <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#DB4437' }}>G</span>
            <span>Sign up with Google</span>
          </button>

          <button className="btn-social">
            <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#1877F2' }}>f</span>
            <span>Sign up with Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
