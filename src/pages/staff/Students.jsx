import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { getStudents, createStudent, updateStudent, deleteStudent, importStudents, exportStudents } from '../../services/studentService';
import toast from 'react-hot-toast';
import { FiSearch, FiPlus, FiUpload, FiDownload, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const initForm = { name: '', rollNo: '', registerNo: '', department: 'CSE', year: 'III', section: 'A', email: '', phone: '', username: '', password: '' };

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department: '', year: '', section: '' });
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (search) params.search = search;
      const res = await getStudents(params);
      setStudents(res.data.students);
    } catch (err) { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [search, filters]);

  const openCreate = () => { setForm(initForm); setEditId(null); setModal(true); };
  const openEdit = (s) => { setForm({ name: s.name, rollNo: s.rollNo, registerNo: s.registerNo, department: s.department, year: s.year, section: s.section, email: s.email, phone: s.phone || '', username: '', password: '' }); setEditId(s._id); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) { await updateStudent(editId, form); toast.success('Student updated!'); }
      else { await createStudent(form); toast.success('Student created!'); }
      setModal(false);
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try { await deleteStudent(id); toast.success('Student deleted'); fetchStudents(); }
    catch (err) { toast.error('Error deleting student'); }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await importStudents(file);
      toast.success(`Imported! Created: ${res.data.created}, Skipped: ${res.data.skipped}`);
      fetchStudents();
    } catch (err) { toast.error('Import failed'); }
    finally { e.target.value = ''; }
  };

  const handleExport = async () => {
    try {
      const res = await exportStudents();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'students.xlsx'; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Exported successfully');
    } catch (err) { toast.error('Export failed'); }
  };

  const YEARS = ['I', 'II', 'III', 'IV'];

  return (
    <Layout title="Students" breadcrumb="Home > Students">
      <div className="card">
        <div className="card-header-custom">
          <h5>👨‍🎓 All Students ({students.length})</h5>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn-outline-custom btn-sm-custom" onClick={handleExport}><FiDownload /> Export</button>
            <button className="btn-outline-custom btn-sm-custom" onClick={() => fileRef.current?.click()}><FiUpload /> Import</button>
            <input ref={fileRef} type="file" accept=".xlsx,.csv" style={{ display: 'none' }} onChange={handleImport} />
            <button className="btn-primary-custom btn-sm-custom" onClick={openCreate}><FiPlus /> Add Student</button>
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: '1', minWidth: '200px' }}>
            <FiSearch className="search-icon" />
            <input className="form-input" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: '130px' }} value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})}>
            <option value="">All Years</option>
            {YEARS.map(y => <option key={y} value={y}>{y} Year</option>)}
          </select>
          <select className="form-select" style={{ width: '130px' }} value={filters.section} onChange={e => setFilters({...filters, section: e.target.value})}>
            <option value="">All Sections</option>
            {['A','B','C'].map(s => <option key={s} value={s}>Section {s}</option>)}
          </select>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div></div>
          ) : students.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👥</div><p>No students found</p></div>
          ) : (
            <table className="table-custom">
              <thead>
                <tr>
                  <th>S.No</th><th>Student Name</th><th>Roll No</th><th>Reg. No</th>
                  <th>Dept</th><th>Year</th><th>Sec</th><th>Email</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s._id}>
                    <td style={{ color: 'var(--text-secondary)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                          {s.name?.charAt(0).toUpperCase()}
                        </div>
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}><span className="badge-custom badge-primary">{s.rollNo}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{s.registerNo}</td>
                    <td>{s.department}</td>
                    <td>{s.year}</td>
                    <td>{s.section}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s.email}</td>
                    <td><span className={`badge-custom ${s.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>{s.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-outline-custom btn-sm-custom" onClick={() => openEdit(s)}><FiEdit2 /></button>
                        <button className="btn-danger-custom btn-sm-custom" onClick={() => handleDelete(s._id)}><FiTrash2 /></button>
                      </div>
                    </td>
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
              <h5>{editId ? '✏️ Edit Student' : '➕ Add New Student'}</h5>
              <button className="modal-close" onClick={() => setModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Student name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Roll No *</label>
                    <input className="form-input" value={form.rollNo} onChange={e => setForm({...form, rollNo: e.target.value})} required placeholder="CSE301" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Register No *</label>
                    <input className="form-input" value={form.registerNo} onChange={e => setForm({...form, registerNo: e.target.value})} required placeholder="712021CS001" disabled={!!editId} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="student@edu.in" />
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
                    <input className="form-input" value={form.section} onChange={e => setForm({...form, section: e.target.value})} placeholder="A" maxLength={2} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="9876543210" />
                  </div>
                  {!editId && <>
                    <div className="form-group">
                      <label className="form-label">Username (defaults to Reg. No)</label>
                      <input className="form-input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Leave blank = Reg. No" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password (defaults to Reg. No)</label>
                      <input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Leave blank = Reg. No" />
                    </div>
                  </>}
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

export default Students;
