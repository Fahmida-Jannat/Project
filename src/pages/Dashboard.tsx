import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1020, #1a1a2e)',
      color: 'white',
      padding: '40px'
    }}>

      <h1>Welcome, {user?.displayName || 'User'} 👋</h1>

      <p style={{ opacity: 0.8 }}>
        This is your dashboard. Expense system coming next.
      </p>

      <button
        onClick={handleLogout}
        style={{
          marginTop: '20px',
          padding: '12px 30px',
          borderRadius: '30px',
          border: 'none',
          background: 'linear-gradient(135deg, #ff0080, #7928ca)',
          color: 'white',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Logout
      </button>

    </div>
  );
};

export default Dashboard;