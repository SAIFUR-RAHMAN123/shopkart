import api from './api';

export const getStats = () => api.get('/admin/stats');
export const getAdminProducts = (params) => api.get('/admin/products', { params });
export const getAdminProduct = (id) => api.get(`/admin/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const getAdminOrders = (params) => api.get('/admin/orders', { params });
export const getAdminOrder = (id) => api.get(`/admin/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/admin/orders/${id}/status`, { status });
export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const setUserActive = (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive });