import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getMySubjectAttendance } from '../../services/attendanceService';
import PercentageCard from '../../components/PercentageCard';
import { calcPercentage } from '../../utils/percentage';

const SubjectAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <Layout title="Subject-wise Attendance" breadcrumb="Home > Attendance > Subject-wise">
      {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
        <>
          {/* Overall Summary */}
          <div className="card" style={{ marginBottom: '20px', background: overall >= 75 ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(99,102,241,0.1))' : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(245,158,11,0.1))', border: `1px solid ${overall >= 75 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            <div className="card-body-custom" style={{ textAlign: 'center', padding: '28px' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: overall >= 75 ? '#34d399' : '#f87171', fontFamily: 'Poppins' }}>{overall}%</div>
              <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>Overall Attendance</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{totalPresent} present / {totalClasses} total classes</div>
              {overall < 75 && (
                <div className="alert-custom alert-danger" style={{ marginTop: '16px', textAlign: 'left' }}>
                  ⚠️ Below 75% threshold! You need <strong>{Math.ceil((0.75 * totalClasses - totalPresent) / 0.25)}</strong> more consecutive attendances to reach 75%.
                </div>
              )}
            </div>
          </div>

          {/* Subject Cards */}
          <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {subjects.map(s => <PercentageCard key={s.subject._id} {...s} />)}
          </div>

          {subjects.length === 0 && (
            <div className="empty-state"><div className="empty-icon">📊</div><p>No attendance data yet. Mark attendance to see data here.</p></div>
          )}
        </>
      )}
    </Layout>
  );
};

export default SubjectAttendance;
