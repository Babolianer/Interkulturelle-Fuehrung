import api from './axios';

export const adminService = {
  getUsers() {
    return api.get('/api/admin/users').then((res) => res.data);
  },
  getUser(id) {
    return api.get(`/api/admin/users/${id}`).then((res) => res.data);
  },
  updateUser(id, data) {
    return api.patch(`/api/admin/users/${id}`, data).then((res) => res.data);
  },
  deleteUser(id) {
    return api.delete(`/api/admin/users/${id}`);
  },
  getSurveys() {
    return api.get('/api/admin/surveys').then((res) => res.data);
  },
  getStats() {
    return api.get('/api/admin/stats').then((res) => res.data);
  },
};
