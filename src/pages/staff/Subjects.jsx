import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../../services/subjectService';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const initForm = { subjectCode: '', subjectName: '', department: 'CSE', year: 'III', semester: 'V', section: 'A', staffId: '' };

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);

  const fetchSubjects = async () => {
    try { setLoading(true); const res = await getSubjects(); setSubjects(res.data.subjects); }
    catch (err) { toast.error('Failed to load subjects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const openEdit = (s) => { setForm({ subjectCode: s.subjectCode, subjectName: s.subjectName, department: s.department, year: s.year, semester: s.semester, section: s.section, staffId: s.staffId?._id || '' }); setEditId(s._id); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) { await updateSubject(editId, form); toast.success('Subject updated!'); }
      else { await createSubject(form); toast.success('Subject created!'); }
      setModal(false); fetchSubjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try { await deleteSubject(id); toast.success('Deleted'); fetchSubjects(); }
    catch (err) { toast.error('Error'); }
  };

  return (
    <Layout title="Subjects" breadcrumb="Home > Subjects">
      <div className="card">
        <div className="card-header-custom">
          <h5>📚 Subject Management</h5>
          <button className="btn-primary-custom btn-sm-custom" onClick={() => { setForm(initForm); setEditId(null); setModal(true); }}><FiPlus /> Add Subject</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
            <table className="table-custom">
              <thead>
                <tr><th>Code</th><th>Subject Name</th><th>Dept</th><th>Year</th><th>Sem</th><th>Section</th><th>Staff</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {subjects.map(s => (
                  <tr key={s._id}>
                    <td><span className="badge-custom badge-primary">{s.subjectCode}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.subjectName}</td>
                    <td>{s.department}</td><td>{s.year}</td><td>{s.semester}</td><td>{s.section}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.staffId?.name || 'N/A'}</td>
                    <td><div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-outline-custom btn-sm-custom" onClick={() => openEdit(s)}><FiEdit2 /></button>
                      <button className="btn-danger-custom btn-sm-custom" onClick={() => handleDelete(s._id)}><FiTrash2 /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{editId ? '✏️ Edit Subject' : '➕ Add Subject'}</h5>
              <button className="modal-close" onClick={() => setModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Subject Code *</label>
                    <input className="form-input" value={form.subjectCode} onChange={e => setForm({...form, subjectCode: e.target.value.toUpperCase()})} required placeholder="CS301" disabled={!!editId} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Subject Name *</label>
                    <input className="form-input" value={form.subjectName} onChange={e => setForm({...form, subjectName: e.target.value})} required placeholder="Database Management Systems" />
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
                    <label className="form-label">Semester</label>
                    <select className="form-select" value={form.semester} onChange={e => setForm({...form, semester: e.target.value})}>
                      {['I','II','III','IV','V','VI','VII','VIII'].map(s => <option key={s} value={s}>{s} Sem</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section</label>
                    <input className="form-input" value={form.section} onChange={e => setForm({...form, section: e.target.value})} placeholder="A" maxLength={2} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline-custom" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-custom" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Subjects;
