import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children, title, breadcrumb }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Auto-close mobile sidebar on page navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      {mobileOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setMobileOpen(false)}
        />
      )}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="main-content">
        <Topbar 
          title={title} 
          breadcrumb={breadcrumb} 
          mobileOpen={mobileOpen} 
          setMobileOpen={setMobileOpen} 
        />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
