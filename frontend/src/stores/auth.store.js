import { defineStore } from 'pinia';
import { TOKEN_STORAGE_KEY } from '../constants/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_STORAGE_KEY) || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(username, password) {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || 'login_failed');
      }
      this.token = data.token;
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    },

    logout() {
      this.token = null;
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    },
  },
});
