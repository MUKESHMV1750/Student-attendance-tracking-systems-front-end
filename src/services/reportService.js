import API from './api';

export const getOverallReport = (params) => API.get('/reports/overall', { params });
export const getDatewiseReport = (params) => API.get('/reports/datewise', { params });
export const exportReport = (params) => API.get('/reports/export', { params, responseType: 'blob' });
export const getAuditLog = () => API.get('/reports/audit');
