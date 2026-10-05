import { create } from 'zustand';
import * as authService from '../services/authService';
import { tokenStorage } from '../services/api';

const initialToken = tokenStorage.get();

export const useAuthStore = create((set) => ({
  user: null, // always loaded from the server, so the role is never trusted from localStorage
  token: initialToken,
  initializing: Boolean(initialToken),

  setUser: (user) => set({ user }),

  login: async (credentials) => {
    const { user, token } = await authService.login(credentials);
    tokenStorage.set(token);
    set({ user, token });
  },

  register: async (data) => {
    const { user, token } = await authService.register(data);
    tokenStorage.set(token);
    set({ user, token });
  },

  logout: () => {
    tokenStorage.clear();
    set({ user: null, token: null });
  },

  fetchMe: async (retries = 2) => {
    if (!tokenStorage.get()) return set({ initializing: false });
    try {
      const { user } = await authService.getMe();
      set({ user, initializing: false });
    } catch (err) {
      if (err.status === 401) {
        tokenStorage.clear();
        return set({ user: null, token: null, initializing: false });
      }
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 3000)); // server may be waking up
        return get().fetchMe(retries - 1);
      }
      set({ initializing: false }); // unreachable: keep the token so a reload can recover
    }
  },
}));

// Fired by the Axios interceptor on expired/invalid tokens
window.addEventListener('auth:logout', () => useAuthStore.setState({ user: null, token: null }));