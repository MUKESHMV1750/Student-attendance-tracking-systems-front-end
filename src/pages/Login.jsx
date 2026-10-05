import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaGraduationCap, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.username}!`);
      if (res.data.user.role === 'staff') navigate('/staff/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (role) => {
    if (role === 'staff') setForm({ username: 'staff001', password: 'staff123' });
    else setForm({ username: '712021CS001', password: '712021CS001' });
  };

  return (
    <div className="login-page">
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div className="login-card">
          <div className="login-logo"><FaGraduationCap /></div>
          <h1 className="login-title">BE Attendance System</h1>
          <p className="login-subtitle">Sign in to continue to your portal</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username / Register No / Email</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  id="login-username"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="Enter username..."
                  value={form.username}
                  onChange={e => setForm({...form, username: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '36px', paddingRight: '40px' }}
                  placeholder="Enter password..."
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button id="login-submit" type="submit" className="btn-primary-custom" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <hr className="divider" style={{ margin: '20px 0' }} />
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '10px' }}>Quick Demo Login</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => demoLogin('staff')} className="btn-outline-custom" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '8px' }}>
              <FaChalkboardTeacher /> Staff Demo
            </button>
            <button onClick={() => demoLogin('student')} className="btn-outline-custom" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '8px' }}>
              <FaUserGraduate /> Student Demo
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.78rem', color: 'var(--border-subtle)' }}>
          BE Engineering Attendance Management System © 2026
        </div>
      </div>
    </div>
  );
};

export default Login;
