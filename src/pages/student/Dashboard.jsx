import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getMySubjectAttendance } from '../../services/attendanceService';
import PercentageCard from '../../components/PercentageCard';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { calcPercentage } from '../../utils/percentage';

const StudentDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getMySubjectAttendance()
      .then(r => setSubjects(r.data.attendance))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPresent = subjects.reduce((s, x) => s + x.present, 0);
  const totalClasses = subjects.reduce((s, x) => s + x.total, 0);
  const overall = calcPercentage(totalPresent, totalClasses);

  return (
    <Layout title="My Dashboard" breadcrumb="Home > Dashboard">
      <div style={{ marginBottom: '24px' }}>
        <h2 className="gradient-text" style={{ fontFamily: 'Poppins', fontSize: '1.5rem', fontWeight: 800 }}>
          Hello, {profile?.name || user?.username}! 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          {profile?.department} • {profile?.year} Year • Section {profile?.section}
        </p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card primary">
          <div className="stat-icon primary">📚</div>
          <div className="stat-value">{subjects.length}</div>
          <div className="stat-label">Subjects</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon success">✅</div>
          <div className="stat-value">{totalPresent}</div>
          <div className="stat-label">Classes Attended</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon danger">❌</div>
          <div className="stat-value">{totalClasses - totalPresent}</div>
          <div className="stat-label">Classes Missed</div>
        </div>
        <div className={`stat-card ${overall >= 75 ? 'success' : 'danger'}`}>
          <div className={`stat-icon ${overall >= 75 ? 'success' : 'danger'}`}>{overall >= 75 ? '🟢' : '🔴'}</div>
          <div className="stat-value">{overall}%</div>
          <div className="stat-label">Overall Attendance</div>
        </div>
      </div>

      {overall < 75 && (
        <div className="alert-custom alert-danger" style={{ marginBottom: '20px' }}>
          ⚠️ Your overall attendance is below 75%! You need to attend more classes to meet the requirement.
        </div>
      )}

      <div className="grid-2" style={{ gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>📊 Subject-wise Attendance</h3>
          {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {subjects.map(s => <PercentageCard key={s.subject._id} {...s} />)}
              {subjects.length === 0 && <div className="empty-state"><div className="empty-icon">📊</div><p>No attendance data yet</p></div>}
            </div>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>⚡ Mark Attendance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div onClick={() => navigate('/student/attendance/mark')} style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(14,165,233,0.15))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '14px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }} className="session-card">
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📱</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Scan QR Code</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Scan the QR code shown by your teacher</div>
            </div>
            <div onClick={() => navigate('/student/attendance/pin')} style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(99,102,241,0.15))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '14px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }} className="session-card">
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔢</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Enter PIN</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Enter the attendance PIN given by your teacher</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
