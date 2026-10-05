import API from './api';

export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const registerStaff = (data) => API.post('/auth/register-staff', data);
export const changePassword = (data) => API.put('/auth/change-password', data);
