export const getUser = () => {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};

export const getToken = () => localStorage.getItem('token');

export const isAuthenticated = () => !!getToken();

export const isStaff = () => {
  const u = getUser();
  return u?.role === 'staff';
};

export const isStudent = () => {
  const u = getUser();
  return u?.role === 'student';
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
