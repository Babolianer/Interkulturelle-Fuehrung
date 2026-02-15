import { defineStore } from 'pinia';
import { authService } from '../api/authService';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY),
    user: (() => {
      try {
        const u = localStorage.getItem(USER_KEY);
        return u ? JSON.parse(u) : null;
      } catch {
        return null;
      }
    })(),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ADMIN',
  },
  actions: {
    setAuth(token, user) {
      this.token = token;
      this.user = user;
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    },
    async login(email, password) {
      const data = await authService.login(email, password);
      this.setAuth(data.token, data.user);
      return data;
    },
    async register(data) {
      const res = await authService.register(data);
      this.setAuth(res.token, res.user);
      return res;
    },
    logout() {
      this.setAuth(null, null);
    },
    async fetchUser() {
      if (!this.token) return null;
      const user = await authService.me();
      this.user = user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    },
  },
});
