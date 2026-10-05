import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getActiveSessions, closeSession, getSessionQR, getSessionAttendance, manualMarkAttendance } from '../../services/attendanceService';
import toast from 'react-hot-toast';
import { FiX, FiRefreshCw, FiCheck, FiXCircle } from 'react-icons/fi';

const ActiveSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewSession, setViewSession] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [attendance, setAttendance] = useState([]);

  const fetchSessions = async () => {
    try { setLoading(true); const res = await getActiveSessions(); setSessions(res.data.sessions); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSessions(); const id = setInterval(fetchSessions, 30000); return () => clearInterval(id); }, []);

  const handleClose = async (id) => {
    if (!window.confirm('Close this attendance session?')) return;
    try { await closeSession(id); toast.success('Session closed'); fetchSessions(); }
    catch { toast.error('Error'); }
  };

  const viewQR = async (s) => {
    try {
      const res = await getSessionQR(s._id);
      setQrImage(res.data.qrImage);
      setQrModal(res.data.session);
    } catch { toast.error('Failed to load QR'); }
  };

  const viewAttendance = async (s) => {
    try {
      const res = await getSessionAttendance(s._id);
      setAttendance(res.data.attendance);
      setViewSession(s);
    } catch { toast.error('Failed to load attendance'); }
  };

  const handleToggleSessionAttendance = async (recordId, studentId, targetStatus) => {
    if (!viewSession) return;
    try {
      await manualMarkAttendance({
        studentId: studentId._id || studentId,
        subjectId: viewSession.subjectId._id || viewSession.subjectId,
        date: viewSession.date,
        sessionId: viewSession._id,
        status: targetStatus,
        reason: 'Manual change during live session'
      });
      toast.success(`Updated to ${targetStatus.toUpperCase()}`);
      viewAttendance(viewSession);
    } catch {
      toast.error('Failed to change status');
    }
  };

  return (
    <Layout title="Active Sessions" breadcrumb="Home > Attendance > Active Sessions">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Auto-refreshes every 30 seconds</div>
        <button className="btn-outline-custom btn-sm-custom" onClick={fetchSessions}><FiRefreshCw /> Refresh</button>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : sessions.length === 0 ? (
        <div className="card"><div className="card-body-custom"><div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No active attendance sessions</p>
          <a href="/staff/attendance/generate"><button className="btn-primary-custom" style={{ marginTop: '12px' }}>Start New Session</button></a>
        </div></div></div>
      ) : (
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}>
          {sessions.map(s => (
            <div key={s._id} className="session-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{s.subjectId?.subjectName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.subjectId?.subjectCode} • {s.date}</div>
                </div>
                <span className="badge-custom badge-success pulse">● LIVE</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px', fontSize: '0.8rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Start</div>
                  <div style={{ fontWeight: 700, color: '#34d399' }}>{s.startTime}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Expires</div>
                  <div style={{ fontWeight: 700, color: '#f87171' }}>{s.expiryTime}</div>
                </div>
              </div>
              <div style={{ marginBottom: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>PIN CODE</div>
                <div style={{ fontFamily: 'Poppins', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.2em', color: '#a5b4fc' }}>{s.pinCode}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-outline-custom btn-sm-custom" style={{ flex: 1, justifyContent: 'center' }} onClick={() => viewQR(s)}>📱 View QR</button>
                <button className="btn-outline-custom btn-sm-custom" style={{ flex: 1, justifyContent: 'center' }} onClick={() => viewAttendance(s)}>👥 Attendance</button>
                <button className="btn-danger-custom btn-sm-custom" onClick={() => handleClose(s._id)}>Close</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)}>
          <div className="modal-box" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5>QR Code - {qrModal.subjectId?.subjectName}</h5>
              <button className="modal-close" onClick={() => setQrModal(null)}><FiX /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              {qrImage && <div className="qr-display-box"><img src={qrImage} alt="QR" /></div>}
              <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Valid: {qrModal.startTime} – {qrModal.expiryTime}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {viewSession && (
        <div className="modal-overlay" onClick={() => setViewSession(null)}>
          <div className="modal-box" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5>👥 Attendance Records - {viewSession.subjectId?.subjectName}</h5>
              <button className="modal-close" onClick={() => setViewSession(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <span className="badge-custom badge-success" style={{ marginRight: '8px' }}>
                    ✅ Present: {attendance.filter(a => a.status === 'present').length}
                  </span>
                  <span className="badge-custom badge-danger">
                    ❌ Absent: {attendance.filter(a => a.status === 'absent').length}
                  </span>
                </div>
              </div>
              {attendance.length === 0 ? <div className="empty-state"><div className="empty-icon">👥</div><p>No attendance marked yet</p></div> : (
                <table className="table-custom">
                  <thead><tr><th>#</th><th>Name</th><th>Roll No</th><th>Status</th><th>Method</th><th>Action</th></tr></thead>
                  <tbody>
                    {attendance.map((a, i) => (
                      <tr key={a._id}>
                        <td>{i+1}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.studentId?.name}</td>
                        <td><span className="badge-custom badge-primary">{a.studentId?.rollNo}</span></td>
                        <td>
                          <span className={`badge-custom ${a.status === 'present' ? 'badge-success' : 'badge-danger'}`}>
                            {a.status === 'present' ? '✅ Present' : '❌ Absent'}
                          </span>
                        </td>
                        <td><span className={`badge-custom ${a.method === 'QR' ? 'badge-info' : a.method === 'PIN' ? 'badge-warning' : 'badge-secondary'}`}>{a.method}</span></td>
                        <td>
                          <button
                            className={`btn-sm-custom ${a.status === 'present' ? 'btn-danger-custom' : 'btn-success-custom'}`}
                            onClick={() => handleToggleSessionAttendance(a._id, a.studentId, a.status === 'present' ? 'absent' : 'present')}
                            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                          >
                            {a.status === 'present' ? 'Mark Absent' : 'Mark Present'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ActiveSessions;
