import API from './api';

export const getStudents = (params) => API.get('/students', { params });
export const getStudent = (id) => API.get(`/students/${id}`);
export const createStudent = (data) => API.post('/students', data);
export const updateStudent = (id, data) => API.put(`/students/${id}`, data);
export const deleteStudent = (id) => API.delete(`/students/${id}`);
export const importStudents = (file) => {
  const fd = new FormData();
  fd.append('file', file);
  return API.post('/students/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const exportStudents = () => API.get('/students/export', { responseType: 'blob' });
