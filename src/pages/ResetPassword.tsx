import React, { useState } from 'react';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../styles/LoginPage.css';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [params] = useSearchParams();
  const navigate = useNavigate();

  const oobCode = params.get('oobCode');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oobCode) {
      toast.error('Invalid or expired reset link');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success('Password reset successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Password reset failed');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="glass-card">
        <h1 className="app-title">Reset Password</h1>
        <p className="subtitle">Create a new secure password</p>

        <form onSubmit={handleResetPassword} className="login-form">
          <div className="input-box">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;