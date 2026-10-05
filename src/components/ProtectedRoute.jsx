import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="loading-spinner" style={{ minHeight: '100vh' }}>
      <div className="spinner"></div>
      <span style={{ color: 'var(--text-secondary)' }}>Loading...</span>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'staff' ? '/staff/dashboard' : '/student/dashboard'} replace />;

  return children;
};

export default ProtectedRoute;
