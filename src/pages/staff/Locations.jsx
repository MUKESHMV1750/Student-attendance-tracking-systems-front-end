import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LocationIcon from '../../components/LocationIcon';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../../services/locationService';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const initForm = { locationName: '', latitude: '', longitude: '', radius: 50 };

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);
  const [gettingLoc, setGettingLoc] = useState(false);

  const fetchLocations = async () => {
    try { setLoading(true); const res = await getLocations(); setLocations(res.data.locations); }
    catch { toast.error('Failed to load locations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLocations(); }, []);

  const getMyLocation = () => {
    setGettingLoc(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setForm(f => ({...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6)})); setGettingLoc(false); },
      () => { toast.error('Location access denied'); setGettingLoc(false); },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) { await updateLocation(editId, form); toast.success('Location updated!'); }
      else { await createLocation(form); toast.success('Location created!'); }
      setModal(false); fetchLocations();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this location?')) return;
    try { await deleteLocation(id); toast.success('Deleted'); fetchLocations(); }
    catch { toast.error('Error'); }
  };

  return (
    <Layout title="Classroom Locations" breadcrumb="Home > Locations">
      <div className="card">
        <div className="card-header-custom">
          <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><LocationIcon /> Classroom GPS Locations</h5>
          <button className="btn-primary-custom btn-sm-custom" onClick={() => { setForm(initForm); setEditId(null); setModal(true); }}><FiPlus /> Add Location</button>
        </div>
        <div className="card-body-custom">
          {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
            <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {locations.map(loc => (
                <div key={loc._id} style={{ background: 'var(--inset-bg)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><LocationIcon /> {loc.locationName}</div>
                      <span className={`badge-custom ${loc.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>{loc.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-outline-custom btn-sm-custom" onClick={() => { setForm({ locationName: loc.locationName, latitude: loc.latitude, longitude: loc.longitude, radius: loc.radius }); setEditId(loc._id); setModal(true); }}><FiEdit2 /></button>
                      <button className="btn-danger-custom btn-sm-custom" onClick={() => handleDelete(loc._id)}><FiTrash2 /></button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                    <div style={{ background: 'rgba(99,102,241,0.1)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>LATITUDE</div>
                      <div style={{ fontFamily: 'monospace', color: '#a5b4fc', fontWeight: 600 }}>{loc.latitude}</div>
                    </div>
                    <div style={{ background: 'rgba(14,165,233,0.1)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>LONGITUDE</div>
                      <div style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>{loc.longitude}</div>
                    </div>
                    <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>RADIUS</div>
                      <div style={{ fontFamily: 'monospace', color: '#34d399', fontWeight: 600 }}>{loc.radius}m</div>
                    </div>
                  </div>
                </div>
              ))}
              {locations.length === 0 && <div className="empty-state"><div className="empty-icon">📍</div><p>No locations configured</p></div>}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{editId ? '✏️ Edit Location' : '➕ Add Location'}</h5>
              <button className="modal-close" onClick={() => setModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Location Name *</label>
                  <input className="form-input" value={form.locationName} onChange={e => setForm({...form, locationName: e.target.value})} required placeholder="CSE Block - Room 201" />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button type="button" className="btn-success-custom" style={{ flex: 1, justifyContent: 'center' }} onClick={getMyLocation} disabled={gettingLoc}>
                    {gettingLoc ? '⏳ Getting location...' : '📍 Use My Current Location'}
                  </button>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Latitude *</label>
                    <input className="form-input" type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} required placeholder="13.0827" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude *</label>
                    <input className="form-input" type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} required placeholder="80.2707" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Allowed Radius (meters): {form.radius}m</label>
                  <input type="range" min="10" max="500" value={form.radius} onChange={e => setForm({...form, radius: e.target.value})} style={{ width: '100%', accentColor: '#6366f1' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}><span>10m</span><span>500m</span></div>
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

export default Locations;
