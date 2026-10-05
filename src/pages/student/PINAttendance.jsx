import { useState } from 'react';
import Layout from '../../components/Layout';
import { markAttendancePIN } from '../../services/attendanceService';
import { getCurrentLocation } from '../../utils/location';
import toast from 'react-hot-toast';

const PINAttendance = () => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [gettingLoc, setGettingLoc] = useState(false);

  const getLocation = async () => {
    setGettingLoc(true);
    try {
      const loc = await getCurrentLocation();
      setLocationData(loc);
      toast.success('Location acquired!');
    } catch (err) { toast.error(err.message); }
    finally { setGettingLoc(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!locationData) { toast.error('Please get your location first!'); return; }
    if (pin.length !== 4) { toast.error('PIN must be 4 digits'); return; }
    setLoading(true);
    try {
      const res = await markAttendancePIN({ pinCode: pin, latitude: locationData.latitude, longitude: locationData.longitude });
      setResult({ success: true, message: res.data.message });
      toast.success('Attendance marked! ✅');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed';
      setResult({ success: false, message: msg });
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const addDigit = (d) => { if (pin.length < 4) setPin(p => p + d); };
  const clearPin = () => setPin('');
  const backspace = () => setPin(p => p.slice(0, -1));

  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  if (result) return (
    <Layout title="Enter PIN" breadcrumb="Home > Mark Attendance > PIN">
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div className={`alert-custom ${result.success ? 'alert-success' : 'alert-danger'}`} style={{ fontSize: '1rem', padding: '24px', borderRadius: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>{result.success ? '✅' : '❌'}</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>{result.success ? 'Attendance Marked!' : 'Failed'}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{result.message}</div>
          <button className="btn-outline-custom" style={{ marginTop: '16px' }} onClick={() => { setResult(null); setPin(''); setLocationData(null); }}>
            Try Again
          </button>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout title="Enter PIN" breadcrumb="Home > Mark Attendance > PIN">
      <div style={{ maxWidth: '380px', margin: '0 auto' }}>
        {/* Location Step */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header-custom">
            <h5>Step 1: Get Location 📍</h5>
            {locationData && <span className="badge-custom badge-success">✅ Got</span>}
          </div>
          <div className="card-body-custom">
            {locationData ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                📍 Location acquired ({locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)})
              </div>
            ) : (
              <button className="btn-success-custom" style={{ width: '100%', justifyContent: 'center' }} onClick={getLocation} disabled={gettingLoc}>
                {gettingLoc ? '⏳ Getting...' : '📍 Get My Location'}
              </button>
            )}
          </div>
        </div>

        {/* PIN Entry */}
        <div className="card">
          <div className="card-header-custom"><h5>Step 2: Enter 4-Digit PIN 🔢</h5></div>
          <div className="card-body-custom">
            <form onSubmit={handleSubmit}>
              {/* PIN Display */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '24px' }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ width: '52px', height: '58px', borderRadius: '12px', background: 'var(--inset-bg)', border: `2px solid ${pin[i] ? 'var(--primary)' : 'var(--border-subtle)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Poppins', transition: 'border-color 0.2s', boxShadow: pin[i] ? '0 0 10px rgba(37, 99, 235, 0.4)' : 'none' }}>
                    {pin[i] ? '●' : ''}
                  </div>
                ))}
              </div>

              {/* Keypad */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {KEYS.map((k, i) => (
                  <button key={i} type="button"
                    onClick={() => { if (k === '⌫') backspace(); else if (k !== '') addDigit(k); }}
                    style={{ padding: '16px', borderRadius: '12px', background: k === '' ? 'transparent' : k === '⌫' ? 'rgba(239,68,68,0.15)' : 'var(--inset-bg)', border: `1px solid ${k === '' ? 'transparent' : k === '⌫' ? 'rgba(239,68,68,0.3)' : 'var(--border-subtle)'}`, color: k === '⌫' ? '#f87171' : 'var(--text-primary)', fontSize: '1.3rem', fontWeight: 700, cursor: k === '' ? 'default' : 'pointer', fontFamily: 'Poppins', transition: 'all 0.15s' }}
                    disabled={k === ''}
                  >{k}</button>
                ))}
              </div>

              <button type="button" onClick={clearPin} className="btn-outline-custom" style={{ width: '100%', justifyContent: 'center', marginBottom: '10px' }}>🗑 Clear</button>

              <button type="submit" className="btn-primary-custom" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading || pin.length !== 4 || !locationData}>
                {loading ? '⏳ Marking attendance...' : '✅ Submit PIN'}
              </button>

              {!locationData && <div className="alert-custom alert-warning" style={{ marginTop: '12px' }}>⚠️ Get your location first</div>}
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PINAttendance;
