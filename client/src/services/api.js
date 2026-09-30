import axios from 'axios';

const TOKEN_KEY = 'shopkart_token';
export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data, // services receive the body directly
  (err) => {
    const status = err.response?.status;
    const data = err.response?.data;

    if (status === 401 && tokenStorage.get()) {
      tokenStorage.clear();
      window.dispatchEvent(new Event('auth:logout'));
    }

    const error = new Error(
      data?.message || (err.request ? 'Cannot reach the server. Please try again.' : 'Something went wrong')
    );
    error.status = status;
    error.errors = data?.errors; // [{ field, message }] for validation errors
    return Promise.reject(error);
  }
);

export default api;