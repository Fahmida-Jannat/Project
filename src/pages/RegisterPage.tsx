import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.css';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCred.user, {
        displayName: fullName,
      });

      toast.success("Registration Successful");

      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');

      navigate('/login');

    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Email already exists");
      } else if (error.code === 'auth/weak-password') {
        toast.error("Password should be at least 6 characters");
      } else {
        toast.error("Registration failed");
      }
    }
  };

  return (
    <div className="register-container">
      <div className="glass-card">
        <h2>Create Account</h2>

        <form onSubmit={handleRegister}>
          <div className="form-grid">

            <div className="input-box">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="input-box">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-box">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-box full-width">
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="full-width">
              <button type="submit" className="btn-primary">
                Register
              </button>
            </div>

          </div>
        </form>
        <p className="login-link">
          Already have an account? <span onClick={() => navigate('/login')}>Login</span>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;