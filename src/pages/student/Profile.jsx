import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, profile } = useAuth();
  return (
    <Layout title="My Profile" breadcrumb="Home > Profile">
      <div style={{ maxWidth: '600px' }}>
        <div className="card">
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(14,165,233,0.2))', padding: '32px', textAlign: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #6366f1, #0ea5e9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'white', margin: '0 auto 16px' }}>
              {profile?.name?.slice(0,2).toUpperCase() || 'ST'}
            </div>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.4rem' }}>{profile?.name}</h2>
            <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{profile?.registerNo}</div>
            <span className="badge-custom badge-primary" style={{ marginTop: '8px', display: 'inline-flex' }}>👨‍🎓 Student</span>
          </div>
          <div className="card-body-custom">
            {[
              { label: 'Roll Number', value: profile?.rollNo, icon: '🎯' },
              { label: 'Register Number', value: profile?.registerNo, icon: '📋' },
              { label: 'Department', value: profile?.department, icon: '🏢' },
              { label: 'Year', value: profile?.year + ' Year', icon: '📅' },
              { label: 'Section', value: 'Section ' + profile?.section, icon: '👥' },
              { label: 'Email', value: profile?.email || user?.email, icon: '📧' },
              { label: 'Phone', value: profile?.phone || 'Not set', icon: '📱' },
              { label: 'Username', value: user?.username, icon: '👤' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{item.icon} {item.label}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{item.value || 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
