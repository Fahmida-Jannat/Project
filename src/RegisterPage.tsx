import React, { useState } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      alert("Account created successfully!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="glass-card">
        <div className="form-section">
          <div style={{ marginBottom: '30px', textAlign: 'left' }}>
            <h1 style={{ 
              margin: '0', 
              fontSize: '3rem', 
              color: '#1a1a2e', 
              fontFamily: "'Playfair Display', serif",
              textShadow: '0 2px 4px rgba(255,255,255,0.3)'
            }}>
              Welcome to
            </h1>
            <p style={{ 
              margin: '5px 0 0', 
              fontSize: '1.2rem', 
              color: '#f0c040',
              fontWeight: '700', 
              fontFamily: "'Playfair Display', serif" 
            }}>
              Expense Tracker
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
             <button type="submit" style={{display: 'none'}}></button>
          </form>
        </div>

        <div className="action-section">
          <img src="/money-bag.jpg" alt="Expense Tracker Illustration" className="side-image" />

          <button onClick={handleRegister} className="btn-primary">Sign Up</button>
          
          <p className="login-link">
            Already have an account? <span className="link-text">Log in</span>
          </p>
          
          <div className="divider">Or</div>
          
          <button onClick={handleGoogleSignIn} className="btn-social google">
            <span style={{fontWeight: 'bold', fontSize: '18px', color: '#DB4437'}}>G</span> 
            <span>Sign up with Google</span>
          </button>
          
          <button className="btn-social facebook">
            <span style={{fontWeight: 'bold', fontSize: '18px', color: '#1877F2'}}>f</span> 
            <span>Sign up with Facebook</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;