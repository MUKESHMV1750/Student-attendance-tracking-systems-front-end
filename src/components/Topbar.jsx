import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiMenu, FiClock, FiActivity } from 'react-icons/fi';

const Topbar = ({ title, breadcrumb, mobileOpen, setMobileOpen }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const now = new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="topbar">
      <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {setMobileOpen && (
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            <FiMenu />
          </button>
        )}
        <div>
          <div className="page-title">{title}</div>
          {breadcrumb && <div className="breadcrumb-pill desktop-only-breadcrumb">{breadcrumb}</div>}
        </div>
      </div>

      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* System Status Indicator */}
        <div className="topbar-badge desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#10b981', background: 'var(--inset-bg)', border: '1px solid var(--border-subtle)', padding: '6px 14px', borderRadius: '20px', fontWeight: 600 }}>
          <FiActivity className="pulse" />
          <span>System Online</span>
        </div>

        {/* Date Capsule */}
        <div className="topbar-badge desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'var(--inset-bg)', border: '1px solid var(--border-subtle)', padding: '6px 14px', borderRadius: '20px', fontWeight: 500 }}>
          <FiClock style={{ color: 'var(--primary-light)' }} />
          <span>{now}</span>
        </div>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <FiSun style={{ color: '#fbbf24' }} /> : <FiMoon style={{ color: '#3b82f6' }} />}
        </button>

        {/* User Capsule */}
        <div className="user-profile-pill">
          <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '0.78rem', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{initials}</div>
          <span className="user-name-text" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.username}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
