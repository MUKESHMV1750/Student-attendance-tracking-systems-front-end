import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getTimetables, createTimetable, deleteTimetable } from '../../services/timetableService';
import { getSubjects } from '../../services/subjectService';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const initForm = { day: 'Monday', startTime: '09:00', endTime: '10:00', subjectId: '', department: 'CSE', year: 'III', section: 'A', room: '' };

const Timetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);
  const [filterDay, setFilterDay] = useState('');

  const fetchAll = async () => {
    try {
      setLoading(true);
      const params = filterDay ? { day: filterDay } : {};
      const [ttRes, subRes] = await Promise.all([getTimetables(params), getSubjects()]);
      setTimetables(ttRes.data.timetables);
      setSubjects(subRes.data.subjects);
    } catch (err) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [filterDay]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const subject = subjects.find(s => s._id === form.subjectId);
      await createTimetable({ ...form, staffId: subject?.staffId?._id || subject?.staffId });
      toast.success('Timetable entry added!'); setModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try { await deleteTimetable(id); toast.success('Deleted'); fetchAll(); }
    catch (err) { toast.error('Error'); }
  };

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = timetables.filter(t => t.day === day);
    return acc;
  }, {});

  return (
    <Layout title="Timetable" breadcrumb="Home > Timetable">
      <div className="card">
        <div className="card-header-custom">
          <h5>📅 Timetable Management</h5>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select className="form-select" style={{ width: '150px' }} value={filterDay} onChange={e => setFilterDay(e.target.value)}>
              <option value="">All Days</option>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button className="btn-primary-custom btn-sm-custom" onClick={() => { setForm(initForm); setModal(true); }}><FiPlus /> Add Entry</button>
          </div>
        </div>
        <div className="card-body-custom">
          {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
            Object.entries(grouped).map(([day, entries]) => entries.length > 0 && (
              <div key={day} style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>{day}</div>
                {entries.map(t => (
                  <div key={t._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--inset-bg)', borderRadius: '8px', marginBottom: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ background: 'rgba(99,102,241,0.15)', borderRadius: '8px', padding: '6px 12px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#a5b4fc', minWidth: '130px', textAlign: 'center' }}>
                        {t.startTime} – {t.endTime}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.subjectId?.subjectName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.subjectId?.subjectCode} • Room: {t.room} • {t.year} Year - {t.section}</div>
                      </div>
                    </div>
                    <button className="btn-danger-custom btn-sm-custom" onClick={() => handleDelete(t._id)}><FiTrash2 /></button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5>➕ Add Timetable Entry</h5>
              <button className="modal-close" onClick={() => setModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Day *</label>
                    <select className="form-select" value={form.day} onChange={e => setForm({...form, day: e.target.value})}>
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Time *</label>
                    <input className="form-input" type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time *</label>
                    <input className="form-input" type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Subject *</label>
                    <select className="form-select" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} required>
                      <option value="">Select subject...</option>
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectCode} - {s.subjectName}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-select" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                      {['CSE','ECE','EEE','MECH','CIVIL','IT'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <select className="form-select" value={form.year} onChange={e => setForm({...form, year: e.target.value})}>
                      {['I','II','III','IV'].map(y => <option key={y} value={y}>{y} Year</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section</label>
                    <input className="form-input" value={form.section} onChange={e => setForm({...form, section: e.target.value})} placeholder="A" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Room *</label>
                    <input className="form-input" value={form.room} onChange={e => setForm({...form, room: e.target.value})} required placeholder="CSE-201" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline-custom" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-custom" disabled={saving}>{saving ? 'Saving...' : 'Add Entry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Timetable;
