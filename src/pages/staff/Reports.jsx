import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getOverallReport, exportReport, getAuditLog } from '../../services/reportService';
import { getSubjects } from '../../services/subjectService';
import PercentageCard from '../../components/PercentageCard';
import toast from 'react-hot-toast';
import { FiDownload } from 'react-icons/fi';
import { getStatusColor } from '../../utils/percentage';

const Reports = () => {
  const [report, setReport] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('overall');
  const [filters, setFilters] = useState({ department: 'CSE', year: 'III', section: 'A', subjectId: '' });

  useEffect(() => { getSubjects().then(r => setSubjects(r.data.subjects)).catch(() => {}); }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await getOverallReport(filters);
      setReport(res.data.report);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const fetchAudit = async () => {
    try { const res = await getAuditLog(); setAudits(res.data.audits); }
    catch { toast.error('Failed to load audit log'); }
  };

  const handleExport = async () => {
    try {
      const res = await exportReport(filters);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'attendance-report.xlsx'; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report exported!');
    } catch { toast.error('Export failed'); }
  };

  const tabStyle = (t) => ({
    padding: '10px 20px',
    background: tab === t ? 'rgba(99,102,241,0.2)' : 'transparent',
    border: `1px solid ${tab === t ? '#6366f1' : 'var(--border-subtle)'}`,
    borderRadius: '8px',
    color: tab === t ? '#a5b4fc' : 'var(--text-secondary)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
    transition: 'all 0.2s'
  });

  return (
    <Layout title="Attendance Reports" breadcrumb="Home > Reports">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button style={tabStyle('overall')} onClick={() => setTab('overall')}>📊 Overall Report</button>
        <button style={tabStyle('audit')} onClick={() => { setTab('audit'); fetchAudit(); }}>📝 Audit Log</button>
      </div>

      {tab === 'overall' && (
        <>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header-custom"><h5>🔍 Filter</h5></div>
            <div style={{ padding: '16px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Dept</label>
                <select className="form-select" value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})}>
                  {['CSE','ECE','EEE','MECH','CIVIL','IT'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Year</label>
                <select className="form-select" value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})}>
                  {['I','II','III','IV'].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Section</label>
                <input className="form-input" style={{ width: '80px' }} value={filters.section} onChange={e => setFilters({...filters, section: e.target.value})} placeholder="A" />
              </div>
              <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
                <label className="form-label">Subject (Optional)</label>
                <select className="form-select" value={filters.subjectId} onChange={e => setFilters({...filters, subjectId: e.target.value})}>
                  <option value="">All Subjects</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectCode}</option>)}
                </select>
              </div>
              <button className="btn-primary-custom" onClick={fetchReport} disabled={loading}>{loading ? '⏳...' : '🔍 Generate'}</button>
              <button className="btn-outline-custom" onClick={handleExport}><FiDownload /> Export</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header-custom">
              <h5>📊 Overall Attendance Report</h5>
              <div>
                <span className="badge-custom badge-success" style={{ marginRight: '8px' }}>✅ Safe: {report.filter(r => r.status === 'safe').length}</span>
                <span className="badge-custom badge-danger">⚠️ Below 75%: {report.filter(r => r.status === 'danger').length}</span>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : report.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📊</div><p>Apply filters and generate report</p></div>
              ) : (
                <table className="table-custom">
                  <thead>
                    <tr><th>#</th><th>Name</th><th>Roll No</th><th>Reg. No</th><th>Total</th><th>Present</th><th>Absent</th><th>Percentage</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {report.map((r, i) => (
                      <tr key={r.student._id}>
                        <td>{i+1}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.student.name}</td>
                        <td><span className="badge-custom badge-primary">{r.student.rollNo}</span></td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.student.registerNo}</td>
                        <td>{r.total}</td>
                        <td style={{ color: '#34d399', fontWeight: 600 }}>{r.present}</td>
                        <td style={{ color: '#f87171', fontWeight: 600 }}>{r.absent}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="percentage-bar-container" style={{ width: '80px' }}>
                              <div className={`percentage-bar ${getStatusColor(r.percentage)}`} style={{ width: `${r.percentage}%` }}></div>
                            </div>
                            <span style={{ fontWeight: 700, color: r.percentage >= 75 ? '#34d399' : r.percentage >= 60 ? '#fbbf24' : '#f87171' }}>{r.percentage}%</span>
                          </div>
                        </td>
                        <td><span className={`badge-custom badge-${r.status === 'safe' ? 'success' : r.status === 'warning' ? 'warning' : 'danger'}`}>{r.label}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {tab === 'audit' && (
        <div className="card">
          <div className="card-header-custom"><h5>📝 Attendance Audit Log</h5></div>
          <div style={{ overflowX: 'auto' }}>
            {audits.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📝</div><p>No audit records</p></div>
            ) : (
              <table className="table-custom">
                <thead><tr><th>#</th><th>Student</th><th>Subject</th><th>Date</th><th>Old</th><th>New</th><th>Edited By</th><th>Reason</th><th>Time</th></tr></thead>
                <tbody>
                  {audits.map((a, i) => (
                    <tr key={a._id}>
                      <td>{i+1}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.studentId?.name}<br/><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.studentId?.rollNo}</span></td>
                      <td style={{ fontSize: '0.8rem' }}>{a.subjectId?.subjectCode}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.date}</td>
                      <td><span className={`badge-custom ${a.oldStatus === 'present' ? 'badge-success' : 'badge-danger'}`}>{a.oldStatus}</span></td>
                      <td><span className={`badge-custom ${a.newStatus === 'present' ? 'badge-success' : 'badge-danger'}`}>{a.newStatus}</span></td>
                      <td style={{ fontSize: '0.8rem' }}>{a.editedBy?.name}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>{a.reason}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(a.editedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Reports;
