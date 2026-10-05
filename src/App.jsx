import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import StaffDashboard from './pages/staff/Dashboard';
import Students from './pages/staff/Students';
import Subjects from './pages/staff/Subjects';
import Timetable from './pages/staff/Timetable';
import Locations from './pages/staff/Locations';
import GenerateAttendance from './pages/staff/GenerateAttendance';
import ActiveSessions from './pages/staff/ActiveSessions';
import ViewAttendance from './pages/staff/ViewAttendance';
import Reports from './pages/staff/Reports';
import StudentDashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import StudentTimetable from './pages/student/Timetable';
import QRScan from './pages/student/QRScan';
import PINAttendance from './pages/student/PINAttendance';
import SubjectAttendance from './pages/student/SubjectAttendance';
import AttendanceHistory from './pages/student/AttendanceHistory';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: 'var(--dark-bg)', color: 'var(--text-primary)', border: '1px solid rgba(255, 255, 255, 0.05)' },
              success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } }
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Staff Routes */}
            <Route path="/staff/dashboard" element={<ProtectedRoute role="staff"><StaffDashboard /></ProtectedRoute>} />
            <Route path="/staff/students" element={<ProtectedRoute role="staff"><Students /></ProtectedRoute>} />
            <Route path="/staff/subjects" element={<ProtectedRoute role="staff"><Subjects /></ProtectedRoute>} />
            <Route path="/staff/timetable" element={<ProtectedRoute role="staff"><Timetable /></ProtectedRoute>} />
            <Route path="/staff/locations" element={<ProtectedRoute role="staff"><Locations /></ProtectedRoute>} />
            <Route path="/staff/attendance/generate" element={<ProtectedRoute role="staff"><GenerateAttendance /></ProtectedRoute>} />
            <Route path="/staff/attendance/sessions" element={<ProtectedRoute role="staff"><ActiveSessions /></ProtectedRoute>} />
            <Route path="/staff/attendance/view" element={<ProtectedRoute role="staff"><ViewAttendance /></ProtectedRoute>} />
            <Route path="/staff/reports" element={<ProtectedRoute role="staff"><Reports /></ProtectedRoute>} />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute role="student"><Profile /></ProtectedRoute>} />
            <Route path="/student/timetable" element={<ProtectedRoute role="student"><StudentTimetable /></ProtectedRoute>} />
            <Route path="/student/attendance/mark" element={<ProtectedRoute role="student"><QRScan /></ProtectedRoute>} />
            <Route path="/student/attendance/pin" element={<ProtectedRoute role="student"><PINAttendance /></ProtectedRoute>} />
            <Route path="/student/attendance/subjects" element={<ProtectedRoute role="student"><SubjectAttendance /></ProtectedRoute>} />
            <Route path="/student/attendance/history" element={<ProtectedRoute role="student"><AttendanceHistory /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
