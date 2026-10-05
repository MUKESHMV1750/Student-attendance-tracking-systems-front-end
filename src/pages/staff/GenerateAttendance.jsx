import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getSubjects } from '../../services/subjectService';
import { getLocations } from '../../services/locationService';
import { getTimetables } from '../../services/timetableService';
import { startSession } from '../../services/attendanceService';
import toast from 'react-hot-toast';
import { MdQrCode } from 'react-icons/md';

const GenerateAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [locations, setLocations] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [qrImage, setQrImage] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().slice(0,5);
  const expiryTime = new Date(Date.now() + 10 * 60000).toTimeString().slice(0,5);

  const [form, setForm] = useState({
    subjectId: '', timetableId: '', locationId: '',
    date: today, startTime: nowTime, expiryTime: expiryTime, sessionType: 'BOTH'
  });

  useEffect(() => {
    Promise.all([getSubjects(), getLocations(), getTimetables()]).then(([s, l, t]) => {
      setSubjects(s.data.subjects);
      setLocations(l.data.locations);
      setTimetables(t.data.timetables);
    }).catch(() => toast.error('Failed to load data'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await startSession(form);
      setSession(res.data.session);
      setQrImage(res.data.qrImage);
      toast.success('Attendance session started!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start session');
    } finally { setLoading(false); }
  };

  const copyPIN = () => {
    navigator.clipboard.writeText(session?.pinCode || '');
    toast.success('PIN copied!');
  };

  if (session) {
    return (
      <Layout title="Active Attendance Session" breadcrumb="Home > Generate Attendance">
        <div className="alert-custom alert-success" style={{ marginBottom: '20px' }}>
          ✅ Attendance session started successfully! Share the QR or PIN with students.
        </div>

        <div className="grid-2" style={{ gap: '20px' }}>
          <div className="card">
            <div className="card-header-custom"><h5>📱 QR Code</h5></div>
            <div className="card-body-custom" style={{ textAlign: 'center' }}>
              {qrImage && <div className="qr-display-box"><img src={qrImage} alt="QR Code" /></div>}
              <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Students scan this QR code to mark attendance
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header-custom"><h5>🔢 PIN Code</h5></div>
            <div className="card-body-custom" style={{ textAlign: 'center' }}>
              <div className="pin-display" style={{ marginBottom: '16px' }}>{session.pinCode}</div>
              <button className="btn-primary-custom" style={{ marginBottom: '12px', width: '100%', justifyContent: 'center' }} onClick={copyPIN}>
                📋 Copy PIN
              </button>
              <div style={{ background: 'var(--inset-bg)', borderRadius: '10px', padding: '14px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Date</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{session.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Valid From</span>
                  <span style={{ fontWeight: 600, color: '#34d399' }}>{session.startTime}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Expires At</span>
                  <span style={{ fontWeight: 600, color: '#f87171' }}>{session.expiryTime}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Session Type</span>
                  <span className="badge-custom badge-primary">{session.sessionType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
          <button className="btn-outline-custom" onClick={() => { setSession(null); setQrImage(null); }}>
            ← Start New Session
          </button>
          <a href="/staff/attendance/sessions" style={{ textDecoration: 'none' }}>
            <button className="btn-primary-custom">View Active Sessions</button>
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Generate Attendance" breadcrumb="Home > Generate QR / PIN">
      <div style={{ maxWidth: '700px' }}>
        <div className="card">
          <div className="card-header-custom">
            <h5><MdQrCode /> Start New Attendance Session</h5>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="card-body-custom">
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select className="form-select" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} required>
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectCode} - {s.subjectName} ({s.year} {s.section})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Timetable Slot (Optional)</label>
                <select className="form-select" value={form.timetableId} onChange={e => setForm({...form, timetableId: e.target.value})}>
                  <option value="">Select slot...</option>
                  {timetables.filter(t => !form.subjectId || t.subjectId?._id === form.subjectId).map(t => (
                    <option key={t._id} value={t._id}>{t.day} - {t.startTime} to {t.endTime} ({t.room})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Classroom Location *</label>
                <select className="form-select" value={form.locationId} onChange={e => setForm({...form, locationId: e.target.value})} required>
                  <option value="">Select location...</option>
                  {locations.map(l => <option key={l._id} value={l._id}>{l.locationName} (Radius: {l.radius}m)</option>)}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Session Type</label>
                  <select className="form-select" value={form.sessionType} onChange={e => setForm({...form, sessionType: e.target.value})}>
                    <option value="BOTH">Both QR & PIN</option>
                    <option value="QR">QR Only</option>
                    <option value="PIN">PIN Only</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input className="form-input" type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Time (Window closes)</label>
                  <input className="form-input" type="time" value={form.expiryTime} onChange={e => setForm({...form, expiryTime: e.target.value})} required />
                </div>
              </div>

              <div className="alert-custom alert-info">
                ℹ️ Students must be physically present within the classroom radius AND within the time window to mark attendance.
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 20px' }}>
              <button type="submit" className="btn-primary-custom" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
                {loading ? '⏳ Starting session...' : '🚀 Start Attendance Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default GenerateAttendance;
