import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getMyAttendance } from '../../services/attendanceService';
import { getSubjects } from '../../services/subjectService';
import { useAuth } from '../../context/AuthContext';

const AttendanceHistory = () => {
  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ subjectId: '' });
  const { profile } = useAuth();

  useEffect(() => {
    getSubjects({ department: profile?.department, year: profile?.year, section: profile?.section })
      .then(r => setSubjects(r.data.subjects)).catch(() => {});
  }, [profile]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getMyAttendance(filters);
      setAttendance(res.data.attendance);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, [filters]);

  return (
    <Layout title="Attendance History" breadcrumb="Home > Attendance > History">
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <select className="form-select" style={{ width: '250px' }} value={filters.subjectId} onChange={e => setFilters({...filters, subjectId: e.target.value})}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectCode} - {s.subjectName}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="card-header-custom">
          <h5>📋 My Attendance Records</h5>
          <div>
            <span className="badge-custom badge-success" style={{ marginRight: '6px' }}>✅ {attendance.filter(a => a.status === 'present').length}</span>
            <span className="badge-custom badge-danger">❌ {attendance.filter(a => a.status === 'absent').length}</span>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : attendance.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📋</div><p>No attendance records found</p></div>
          ) : (
            <table className="table-custom">
              <thead><tr><th>#</th><th>Date</th><th>Subject</th><th>Time</th><th>Status</th><th>Method</th></tr></thead>
              <tbody>
                {attendance.map((a, i) => (
                  <tr key={a._id}>
                    <td style={{ color: 'var(--text-secondary)' }}>{i+1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.date}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.subjectId?.subjectName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.subjectId?.subjectCode}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.startTime}</td>
                    <td><span className={`badge-custom ${a.status === 'present' ? 'badge-success' : 'badge-danger'}`}>{a.status === 'present' ? '✅ Present' : '❌ Absent'}</span></td>
                    <td><span className={`badge-custom ${a.method === 'QR' ? 'badge-info' : a.method === 'PIN' ? 'badge-warning' : 'badge-secondary'}`}>{a.method}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AttendanceHistory;
