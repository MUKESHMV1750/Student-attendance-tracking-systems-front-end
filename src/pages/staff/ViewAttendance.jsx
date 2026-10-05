import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getDatewiseReport } from '../../services/reportService';
import { editAttendance, getManualClassRoster, manualMarkAttendance, bulkManualMarkAttendance } from '../../services/attendanceService';
import { getSubjects } from '../../services/subjectService';
import toast from 'react-hot-toast';
import { FiX, FiCheck, FiXCircle, FiUsers, FiSearch, FiEdit } from 'react-icons/fi';

const ViewAttendance = () => {
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'logs'
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    subjectId: '',
    date: new Date().toISOString().split('T')[0],
    department: '',
    year: '',
    section: ''
  });

  // Class Roster State
  const [roster, setRoster] = useState([]);
  const [targetSubject, setTargetSubject] = useState(null);

  // Logged Records State
  const [attendanceLogs, setAttendanceLogs] = useState([]);

  // Edit Modal State
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ status: 'present', reason: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSubjects().then(r => {
      setSubjects(r.data.subjects || []);
      if (r.data.subjects && r.data.subjects.length > 0) {
        setFilters(prev => ({ ...prev, subjectId: r.data.subjects[0]._id }));
      }
    }).catch(() => {});
  }, []);

  // Fetch Class Roster with attendance status
  const fetchRoster = async () => {
    if (!filters.subjectId) {
      return toast.error('Please select a subject first');
    }
    setLoading(true);
    try {
      const res = await getManualClassRoster(filters);
      setRoster(res.data.roster || []);
      setTargetSubject(res.data.subject || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load class roster');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Logged Records
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getDatewiseReport(filters);
      setAttendanceLogs(res.data.attendance || []);
    } catch {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.subjectId) {
      if (activeTab === 'roster') fetchRoster();
      else fetchLogs();
    }
  }, [activeTab, filters.subjectId, filters.date]);

  // Quick Toggle Present / Absent
  const handleToggleStatus = async (studentId, currentStatus, targetStatus) => {
    if (currentStatus === targetStatus && currentStatus !== 'unmarked') return;
    setSavingId(studentId);
    try {
      await manualMarkAttendance({
        studentId,
        subjectId: filters.subjectId,
        date: filters.date,
        status: targetStatus,
        reason: 'Staff manual change'
      });
      toast.success(`Marked as ${targetStatus.toUpperCase()}`);
      
      // Update local state instantly
      setRoster(prev => prev.map(item => {
        if (item.student._id === studentId) {
          return { ...item, status: targetStatus, isMarked: true, method: 'STAFF' };
        }
        return item;
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSavingId(null);
    }
  };

  // Bulk Mark All Present / Absent
  const handleBulkMark = async (status) => {
    if (!roster.length) return;
    if (!window.confirm(`Are you sure you want to mark ALL ${roster.length} students as ${status.toUpperCase()}?`)) return;

    setLoading(true);
    try {
      const studentIds = roster.map(r => r.student._id);
      await bulkManualMarkAttendance({
        subjectId: filters.subjectId,
        date: filters.date,
        status,
        studentIds,
        reason: `Bulk marked ${status} by staff`
      });
      toast.success(`All students marked as ${status.toUpperCase()}`);
      fetchRoster();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk update failed');
      setLoading(false);
    }
  };

  // Detailed Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.reason) return toast.error('Please provide a reason for editing');
    setSaving(true);
    try {
      if (editModal.studentId) {
        // From roster or logs
        const sId = editModal.studentId._id || editModal.studentId;
        await manualMarkAttendance({
          studentId: sId,
          subjectId: filters.subjectId || editModal.subjectId?._id || editModal.subjectId,
          date: editModal.date || filters.date,
          status: editForm.status,
          reason: editForm.reason
        });
      }
      toast.success('Attendance updated successfully!');
      setEditModal(null);
      if (activeTab === 'roster') fetchRoster();
      else fetchLogs();
    } catch {
      toast.error('Failed to edit attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = roster.filter(r => r.status === 'present').length;
  const absentCount = roster.filter(r => r.status === 'absent').length;

  return (
    <Layout title="Staff Manual Attendance & Records" breadcrumb="Home > Attendance > View & Edit">
      {/* Mode Switcher Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          className={`btn-primary-custom ${activeTab !== 'roster' ? 'btn-outline-custom' : ''}`}
          onClick={() => setActiveTab('roster')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px' }}
        >
          <FiUsers /> Manual Attendance Roster
        </button>
        <button
          className={`btn-primary-custom ${activeTab !== 'logs' ? 'btn-outline-custom' : ''}`}
          onClick={() => setActiveTab('logs')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px' }}
        >
          <FiSearch /> Search Attendance Logs
        </button>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header-custom">
          <h5>🔍 Filter Options</h5>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0, flex: '1', minWidth: '220px' }}>
            <label className="form-label">Subject *</label>
            <select
              className="form-select"
              value={filters.subjectId}
              onChange={e => setFilters({ ...filters, subjectId: e.target.value })}
            >
              <option value="">Select Subject</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>
                  {s.subjectCode} - {s.subjectName} ({s.department} {s.year} Year Sec-{s.section})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Date *</label>
            <input
              className="form-input"
              type="date"
              value={filters.date}
              onChange={e => setFilters({ ...filters, date: e.target.value })}
            />
          </div>

          <button
            className="btn-primary-custom"
            onClick={activeTab === 'roster' ? fetchRoster : fetchLogs}
            disabled={loading}
          >
            {loading ? '⏳ Loading...' : '🔍 Load Roster / Logs'}
          </button>
        </div>
      </div>

      {/* Tab 1: Manual Class Roster */}
      {activeTab === 'roster' && (
        <div className="card">
          <div className="card-header-custom" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h5>👥 Class Attendance Sheet ({roster.length} Students)</h5>
              {targetSubject && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {targetSubject.subjectCode} • {targetSubject.department} (Year {targetSubject.year}, Sec {targetSubject.section})
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge-custom badge-success" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                ✅ Present: {presentCount}
              </span>
              <span className="badge-custom badge-danger" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                ❌ Absent: {absentCount}
              </span>

              <button
                className="btn-success-custom btn-sm-custom"
                onClick={() => handleBulkMark('present')}
                disabled={loading || roster.length === 0}
                style={{ background: '#10b981', border: 'none', color: '#fff', fontWeight: 600, padding: '6px 14px', borderRadius: '8px' }}
              >
                <FiCheck /> Mark All Present
              </button>

              <button
                className="btn-danger-custom btn-sm-custom"
                onClick={() => handleBulkMark('absent')}
                disabled={loading || roster.length === 0}
                style={{ padding: '6px 14px', borderRadius: '8px' }}
              >
                <FiXCircle /> Mark All Absent
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div className="loading-spinner"><div className="spinner"></div></div>
            ) : roster.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <p>No students found for this subject/class. Select a subject above.</p>
              </div>
            ) : (
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Register No</th>
                    <th>Current Status</th>
                    <th>Method</th>
                    <th style={{ textAlign: 'center' }}>Manual Change / Toggle</th>
                    <th>Edit Log</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((item, i) => {
                    const isSaving = savingId === item.student._id;
                    const isPresent = item.status === 'present';
                    const isAbsent = item.status === 'absent';

                    return (
                      <tr key={item.student._id}>
                        <td>{i + 1}</td>
                        <td>
                          <span className="badge-custom badge-primary">{item.student.rollNo}</span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.student.name}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {item.student.registerNo}
                        </td>
                        <td>
                          <span className={`badge-custom ${isPresent ? 'badge-success' : 'badge-danger'}`}>
                            {isPresent ? '✅ Present' : '❌ Absent'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-custom ${item.method === 'QR' ? 'badge-info' : item.method === 'PIN' ? 'badge-warning' : item.method === 'STAFF' ? 'badge-primary' : 'badge-secondary'}`}>
                            {item.method}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', background: 'var(--inset-bg)', padding: '4px', borderRadius: '8px' }}>
                            <button
                              disabled={isSaving}
                              onClick={() => handleToggleStatus(item.student._id, item.status, 'present')}
                              style={{
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: isPresent ? '#10b981' : 'transparent',
                                color: isPresent ? '#fff' : 'var(--text-secondary)',
                                boxShadow: isPresent ? '0 2px 8px rgba(16,185,129,0.3)' : 'none'
                              }}
                            >
                              {isSaving && isPresent ? '⏳...' : '✅ Present'}
                            </button>

                            <button
                              disabled={isSaving}
                              onClick={() => handleToggleStatus(item.student._id, item.status, 'absent')}
                              style={{
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: isAbsent ? '#ef4444' : 'transparent',
                                color: isAbsent ? '#fff' : 'var(--text-secondary)',
                                boxShadow: isAbsent ? '0 2px 8px rgba(239,68,68,0.3)' : 'none'
                              }}
                            >
                              {isSaving && isAbsent ? '⏳...' : '❌ Absent'}
                            </button>
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn-outline-custom btn-sm-custom"
                            onClick={() => {
                              setEditModal({
                                studentId: item.student,
                                subjectId: targetSubject,
                                date: filters.date,
                                status: item.status
                              });
                              setEditForm({
                                status: item.status === 'present' ? 'absent' : 'present',
                                reason: ''
                              });
                            }}
                          >
                            <FiEdit /> Reason
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Logs */}
      {activeTab === 'logs' && (
        <div className="card">
          <div className="card-header-custom">
            <h5>📋 Attendance Records ({attendanceLogs.length})</h5>
            <div>
              <span className="badge-custom badge-success" style={{ marginRight: '8px' }}>
                ✅ Present: {attendanceLogs.filter(a => a.status === 'present').length}
              </span>
              <span className="badge-custom badge-danger">
                ❌ Absent: {attendanceLogs.filter(a => a.status === 'absent').length}
              </span>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div className="loading-spinner"><div className="spinner"></div></div>
            ) : attendanceLogs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No records found for the selected filter.</p>
              </div>
            ) : (
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Roll No</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Method</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceLogs.map((a, i) => (
                    <tr key={a._id}>
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.studentId?.name}</td>
                      <td><span className="badge-custom badge-primary">{a.studentId?.rollNo}</span></td>
                      <td style={{ fontSize: '0.8rem' }}>{a.subjectId?.subjectCode}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.date}</td>
                      <td>
                        <span className={`badge-custom ${a.status === 'present' ? 'badge-success' : 'badge-danger'}`}>
                          {a.status === 'present' ? '✅ Present' : '❌ Absent'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-custom ${a.method === 'QR' ? 'badge-info' : a.method === 'PIN' ? 'badge-warning' : 'badge-secondary'}`}>
                          {a.method}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-outline-custom btn-sm-custom"
                          onClick={() => {
                            setEditModal(a);
                            setEditForm({
                              status: a.status === 'present' ? 'absent' : 'present',
                              reason: ''
                            });
                          }}
                        >
                          <FiEdit /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal-box" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5>✏️ Edit Student Attendance</h5>
              <button className="modal-close" onClick={() => setEditModal(null)}><FiX /></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div style={{ background: 'var(--inset-bg)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Student</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {editModal.studentId?.name || editModal.studentId?.rollNo}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subject</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {editModal.subjectId?.subjectName || editModal.subjectId?.subjectCode}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Date</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {editModal.date || filters.date}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Current Status</span>
                    <span className={`badge-custom ${editModal.status === 'present' ? 'badge-success' : 'badge-danger'}`}>
                      {editModal.status}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Status *</label>
                  <select
                    className="form-select"
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="present">✅ Present</option>
                    <option value="absent">❌ Absent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Change *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={editForm.reason}
                    onChange={e => setEditForm({ ...editForm, reason: e.target.value })}
                    required
                    placeholder="Provide a reason for auditing..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline-custom" onClick={() => setEditModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-custom" disabled={saving}>
                  {saving ? 'Saving...' : 'Update Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ViewAttendance;
