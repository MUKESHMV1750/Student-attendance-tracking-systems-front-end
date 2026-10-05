import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getStudents } from '../../services/studentService';
import { getSubjects } from '../../services/subjectService';
import { getActiveSessions } from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';
import { FiUsers, FiBook, FiClock, FiCheckSquare } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ students: 0, subjects: 0, activeSessions: 0 });
  const [sessions, setSessions] = useState([]);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [stuRes, subRes, sesRes] = await Promise.all([
          getStudents(), getSubjects(), getActiveSessions()
        ]);
        setStats({ students: stuRes.data.total, subjects: subRes.data.subjects.length, activeSessions: sesRes.data.sessions.length });
        setSessions(sesRes.data.sessions);
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  return (
    <Layout title="Staff Dashboard" breadcrumb="Home > Dashboard">
      <div style={{ marginBottom: '24px' }}>
        <h2 className="gradient-text" style={{ fontFamily: 'Poppins', fontSize: '1.6rem', fontWeight: 800 }}>
          Welcome back, {profile?.name || user?.username}! 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Here's your attendance overview for today</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon primary"><FiUsers /></div>
          <div className="stat-value">{stats.students}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon success"><FiBook /></div>
          <div className="stat-value">{stats.subjects}</div>
          <div className="stat-label">Active Subjects</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon warning"><FiClock /></div>
          <div className="stat-value">{stats.activeSessions}</div>
          <div className="stat-label">Active Sessions</div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon info"><FiCheckSquare /></div>
          <div className="stat-value">02</div>
          <div className="stat-label">Today's Classes</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '20px' }}>
        <div className="card">
          <div className="card-header-custom">
            <h5>🟢 Active Attendance Sessions</h5>
            <button className="btn-primary-custom btn-sm-custom" onClick={() => navigate('/staff/attendance/generate')}>+ New Session</button>
          </div>
          <div className="card-body-custom">
            {sessions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No active sessions</p>
                <button className="btn-primary-custom" style={{ marginTop: '12px' }} onClick={() => navigate('/staff/attendance/generate')}>
                  Start Attendance Session
                </button>
              </div>
            ) : (
              sessions.map(s => (
                <div key={s._id} className="session-card" style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.subjectId?.subjectName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.subjectId?.subjectCode} • {s.date}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>⏰ {s.startTime} → {s.expiryTime}</div>
                    </div>
                    <div>
                      <span className="badge-custom badge-success pulse">● Active</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header-custom">
            <h5>⚡ Quick Actions</h5>
          </div>
          <div className="card-body-custom" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: '📲 Generate QR / PIN', path: '/staff/attendance/generate', color: '#6366f1' },
              { label: '👨‍🎓 Add New Student', path: '/staff/students', color: '#10b981' },
              { label: '📚 Manage Subjects', path: '/staff/subjects', color: '#0ea5e9' },
              { label: '📅 View Timetable', path: '/staff/timetable', color: '#f59e0b' },
              { label: '📊 Attendance Reports', path: '/staff/reports', color: '#ef4444' },
            ].map(a => (
              <button key={a.path} onClick={() => navigate(a.path)} style={{ background: `${a.color}15`, border: `1px solid ${a.color}30`, borderRadius: '10px', padding: '12px 16px', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s' }}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
