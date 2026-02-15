import api from './axios';

export const authService = {
  register(data) {
    return api.post('/api/auth/register', data).then((res) => res.data);
  },
  login(email, password) {
    return api.post('/api/auth/login', { email, password }).then((res) => res.data);
  },
  me() {
    return api.get('/api/auth/me').then((res) => res.data);
  },
};
