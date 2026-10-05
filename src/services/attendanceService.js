import API from './api';

export const startSession = (data) => API.post('/attendance/session/start', data);
export const getActiveSessions = () => API.get('/attendance/session/active');
export const closeSession = (id) => API.put(`/attendance/session/${id}/close`);
export const getSessionQR = (id) => API.get(`/attendance/session/${id}/qr`);
export const getSessionAttendance = (sessionId) => API.get(`/attendance/session/${sessionId}/records`);
export const editAttendance = (id, data) => API.put(`/attendance/${id}/edit`, data);
export const markAttendanceQR = (data) => API.post('/attendance/mark/qr', data);
export const markAttendancePIN = (data) => API.post('/attendance/mark/pin', data);
export const getMyAttendance = (params) => API.get('/attendance/my', { params });
export const getMySubjectAttendance = () => API.get('/attendance/my/subjects');
export const getStudentSubjectAttendance = (studentId) => API.get(`/attendance/student/${studentId}/subjects`);
export const getManualClassRoster = (params) => API.get('/attendance/manual-roster', { params });
export const manualMarkAttendance = (data) => API.post('/attendance/manual-mark', data);
export const bulkManualMarkAttendance = (data) => API.post('/attendance/bulk-manual-mark', data);
