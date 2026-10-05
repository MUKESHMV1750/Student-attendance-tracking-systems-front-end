import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import LocationIcon from '../../components/LocationIcon';
import { markAttendanceQR } from '../../services/attendanceService';
import { getCurrentLocation } from '../../utils/location';
import toast from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';
import { FiCamera, FiUpload, FiCheckCircle, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

const QRScan = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [gettingLoc, setGettingLoc] = useState(false);
  const html5QrRef = useRef(null);
  const fileInputRef = useRef(null);

  const getLocation = async () => {
    setGettingLoc(true);
    try {
      const loc = await getCurrentLocation();
      setLocationData(loc);
      toast.success(`Location acquired! Accuracy: ±${Math.round(loc.accuracy)}m`);
    } catch (err) {
      toast.error(err.message);
    } finally { setGettingLoc(false); }
  };

  const startScanner = async () => {
    if (!locationData) {
      toast.error('Please get your location first!');
      return;
    }
    setScanning(true);
    setError(null);
    try {
      html5QrRef.current = new Html5Qrcode('qr-reader');
      try {
        await html5QrRef.current.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            html5QrRef.current.stop().catch(() => {});
            setScanning(false);
            handleQRData(decodedText);
          },
          () => {}
        );
      } catch (firstErr) {
        // Fallback to front / default camera if environment facing mode fails
        await html5QrRef.current.start(
          { facingMode: 'user' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            html5QrRef.current.stop().catch(() => {});
            setScanning(false);
            handleQRData(decodedText);
          },
          () => {}
        );
      }
    } catch (err) {
      setScanning(false);
      setError('Camera access is blocked or no camera was found. Click the padlock 🔒 in your browser address bar -> Allow Camera, or use the "Upload QR Image" option below.');
      toast.error('Camera access denied or unavailable');
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current && scanning) {
      await html5QrRef.current.stop().catch(() => {});
      setScanning(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!locationData) {
      toast.error('Please get your location first!');
      return;
    }
    setLoading(true);
    try {
      const html5QrCode = new Html5Qrcode('qr-reader-file-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleQRData(decodedText);
    } catch (err) {
      toast.error('Could not read a valid QR code from this image. Please try taking a clearer photo.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrRef.current && scanning) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, [scanning]);

  const handleQRData = async (text) => {
    setLoading(true);
    try {
      const data = JSON.parse(text);
      const res = await markAttendanceQR({
        qrToken: data.token,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      });
      setResult({ success: true, message: res.data.message });
      toast.success('Attendance marked! You are PRESENT ✅');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired QR code';
      setResult({ success: false, message: msg });
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <Layout title="Scan QR Code" breadcrumb="Home > Mark Attendance > Scan QR">
      <div style={{ maxWidth: '540px', margin: '0 auto' }}>
        <div id="qr-reader-file-temp" style={{ display: 'none' }}></div>

        {result ? (
          <div className={`alert-custom ${result.success ? 'alert-success' : 'alert-danger'}`} style={{ fontSize: '1rem', padding: '24px', borderRadius: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '3.2rem', marginBottom: '12px' }}>{result.success ? '✅' : '❌'}</div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '8px' }}>{result.success ? 'Attendance Marked!' : 'Failed to Mark'}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{result.message}</div>
            <button className="btn-outline-custom" style={{ marginTop: '20px' }} onClick={() => { setResult(null); setLocationData(null); }}>
              <FiRefreshCw /> Mark Another Session
            </button>
          </div>
        ) : (
          <>
            {/* Step 1: Location */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-header-custom">
                <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><LocationIcon /> Step 1: Acquire Location</h5>
                {locationData && <span className="badge-custom badge-success"><FiCheckCircle /> Verified</span>}
              </div>
              <div className="card-body-custom">
                {locationData ? (
                  <div style={{ background: 'var(--inset-bg)', borderRadius: '12px', padding: '16px', fontSize: '0.86rem', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Latitude</span>
                      <span style={{ fontFamily: 'monospace', color: 'var(--primary-light)', fontWeight: 600 }}>{locationData.latitude.toFixed(6)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Longitude</span>
                      <span style={{ fontFamily: 'monospace', color: 'var(--primary-light)', fontWeight: 600 }}>{locationData.longitude.toFixed(6)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Accuracy</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>±{Math.round(locationData.accuracy)} meters</span>
                    </div>
                  </div>
                ) : (
                  <button className="btn-success-custom" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} onClick={getLocation} disabled={gettingLoc}>
                    {gettingLoc ? 'Acquiring GPS Location...' : <><LocationIcon style={{ color: '#ffffff' }} /> Click to Acquire Current Location</>}
                  </button>
                )}
              </div>
            </div>

            {/* Step 2: Scan QR */}
            <div className="card">
              <div className="card-header-custom">
                <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiCamera style={{ color: 'var(--primary-light)' }} /> Step 2: Scan Class QR Code</h5>
              </div>
              <div className="card-body-custom">
                {error && (
                  <div className="alert-custom alert-warning" style={{ marginBottom: '16px', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><FiAlertTriangle /> Camera Access Blocked</div>
                    <div style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>{error}</div>
                  </div>
                )}

                {loading ? (
                  <div className="loading-spinner"><div className="spinner"></div><span>Validating QR Code & Location...</span></div>
                ) : (
                  <>
                    <div id="qr-reader" style={{ width: '100%', borderRadius: '14px', overflow: 'hidden', background: 'var(--inset-bg)', minHeight: scanning ? '280px' : '0' }}></div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                      {!scanning ? (
                        <button className="btn-primary-custom" style={{ width: '100%', justifyContent: 'center', padding: '13px' }} onClick={startScanner} disabled={!locationData}>
                          <FiCamera /> Start Live Camera Scanner
                        </button>
                      ) : (
                        <button className="btn-danger-custom" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} onClick={stopScanner}>
                          ⏹ Stop Camera Scanner
                        </button>
                      )}

                      {/* Fallback File Upload Option */}
                      <button 
                        className="btn-outline-custom" 
                        style={{ width: '100%', justifyContent: 'center', padding: '11px' }} 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!locationData}
                      >
                        <FiUpload /> Upload QR Code Image / Photo
                      </button>
                      <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={handleFileUpload} 
                      />
                    </div>

                    {!locationData && (
                      <div className="alert-custom alert-warning" style={{ marginTop: '16px', fontSize: '0.82rem' }}>
                        ⚠️ Please acquire your GPS location in Step 1 before scanning or uploading the QR code.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default QRScan;
