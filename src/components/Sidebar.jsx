import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiUsers, FiBook, FiCalendar, FiBarChart2, FiLogOut, FiUser, FiClock, FiCheckSquare, FiGrid, FiX } from 'react-icons/fi';
import { MdQrCode, MdOutlinePin } from 'react-icons/md';
import { FaGraduationCap } from 'react-icons/fa';
import LocationIcon from './LocationIcon';

const StaffNav = () => (
  <>
    <div className="nav-section-title">Main Menu</div>
    <NavLink to="/staff/dashboard" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <FiHome className="nav-icon" /> <span>Dashboard</span>
    </NavLink>

    <div className="nav-section-title">People & Academic</div>
    <NavLink to="/staff/students" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <FiUsers className="nav-icon" /> <span>Students</span>
    </NavLink>
    <NavLink to="/staff/subjects" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <FiBook className="nav-icon" /> <span>Subjects</span>
    </NavLink>
    <NavLink to="/staff/timetable" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <FiCalendar className="nav-icon" /> <span>Timetable</span>
    </NavLink>
    <NavLink to="/staff/locations" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <LocationIcon style={{ fontSize: '1.15rem' }} /> <span>Locations</span>
    </NavLink>

    <div className="nav-section-title">Attendance</div>
    <NavLink to="/staff/attendance/generate" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <MdQrCode className="nav-icon" /> <span>Generate QR / PIN</span>
    </NavLink>
    <NavLink to="/staff/attendance/sessions" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <FiClock className="nav-icon" /> <span>Active Sessions</span>
    </NavLink>
    <NavLink to="/staff/attendance/view" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <FiCheckSquare className="nav-icon" /> <span>View & Edit Logs</span>
    </NavLink>

    <div className="nav-section-title">Analytics</div>
    <NavLink to="/staff/reports" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <FiBarChart2 className="nav-icon" /> <span>Attendance Reports</span>
    </NavLink>
  </>
);

const StudentNav = () => (
  <>
    <div className="nav-section-title">Overview</div>
    <NavLink to="/student/dashboard" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <FiHome className="nav-icon" /> <span>Dashboard</span>
    </NavLink>
    <NavLink to="/student/profile" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <FiUser className="nav-icon" /> <span>My Profile</span>
    </NavLink>
    <NavLink to="/student/timetable" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <FiCalendar className="nav-icon" /> <span>Timetable</span>
    </NavLink>

    <div className="nav-section-title">Mark Attendance</div>
    <NavLink to="/student/attendance/mark" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <MdQrCode className="nav-icon" /> <span>Scan QR Code</span>
    </NavLink>
    <NavLink to="/student/attendance/pin" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <MdOutlinePin className="nav-icon" /> <span>Enter Session PIN</span>
    </NavLink>

    <div className="nav-section-title">My Records</div>
    <NavLink to="/student/attendance/subjects" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <FiGrid className="nav-icon" /> <span>Subject Breakdown</span>
    </NavLink>
    <NavLink to="/student/attendance/history" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <FiBarChart2 className="nav-icon" /> <span>Attendance History</span>
    </NavLink>
  </>
);

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-icon"><FaGraduationCap /></div>
          <div>
            <h4>BE Attendance</h4>
            <div className="brand-sub">Management Portal</div>
          </div>
        </div>
        {setMobileOpen && (
          <button 
            className="mobile-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <FiX />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {user?.role === 'staff' ? <StaffNav /> : <StudentNav />}
      </nav>

      <div className="sidebar-user">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</div>
            <div className="user-role badge-custom badge-primary" style={{ padding: '2px 8px', fontSize: '0.68rem', marginTop: '2px' }}>{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-outline-custom" style={{ width: '100%', justifyContent: 'center', padding: '9px', fontSize: '0.82rem', marginTop: '8px' }}>
          <FiLogOut /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
