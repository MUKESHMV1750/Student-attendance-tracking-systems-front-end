import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getTimetables } from '../../services/timetableService';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const StudentTimetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      getTimetables({ department: profile.department, year: profile.year, section: profile.section })
        .then(r => setTimetables(r.data.timetables))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [profile]);

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = timetables.filter(t => t.day === day);
    return acc;
  }, {});

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <Layout title="My Timetable" breadcrumb="Home > Timetable">
      <div style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        Today is <strong style={{ color: '#a5b4fc' }}>{today}</strong>
      </div>
      {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {DAYS.map(day => grouped[day].length > 0 && (
            <div key={day} className="card">
              <div className="card-header-custom" style={{ background: day === today ? 'rgba(99,102,241,0.1)' : undefined }}>
                <h5>{day === today ? '📍 ' : ''}{day} {day === today && <span className="badge-custom badge-primary" style={{ marginLeft: '8px' }}>Today</span>}</h5>
              </div>
              <div className="card-body-custom" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {grouped[day].map(t => (
                  <div key={t._id} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px', background: 'var(--inset-bg)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ background: 'rgba(99,102,241,0.15)', borderRadius: '8px', padding: '8px 14px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#a5b4fc', minWidth: '140px', textAlign: 'center' }}>
                      {t.startTime} – {t.endTime}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.subjectId?.subjectName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.subjectId?.subjectCode} • 🏫 {t.room}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.values(grouped).every(d => d.length === 0) && (
            <div className="empty-state"><div className="empty-icon">📅</div><p>No timetable found for your class</p></div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default StudentTimetable;
