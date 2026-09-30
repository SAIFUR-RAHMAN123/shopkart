import { create } from 'zustand';
import * as authService from '../services/authService';
import { tokenStorage } from '../services/api';

const initialToken = tokenStorage.get();

export const useAuthStore = create((set) => ({
  user: null, // always loaded from the server, so the role is never trusted from localStorage
  token: initialToken,
  initializing: Boolean(initialToken),

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

  fetchMe: async () => {
    if (!tokenStorage.get()) return set({ initializing: false });
    try {
      const { user } = await authService.getMe();
      set({ user, initializing: false });
    } catch {
      tokenStorage.clear();
      set({ user: null, token: null, initializing: false });
    }
  },
}));

// Fired by the Axios interceptor on expired/invalid tokens
window.addEventListener('auth:logout', () => useAuthStore.setState({ user: null, token: null }));