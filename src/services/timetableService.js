import API from './api';

export const getTimetables = (params) => API.get('/timetables', { params });
export const createTimetable = (data) => API.post('/timetables', data);
export const updateTimetable = (id, data) => API.put(`/timetables/${id}`, data);
export const deleteTimetable = (id) => API.delete(`/timetables/${id}`);
