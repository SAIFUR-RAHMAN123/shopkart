import api from './api';

export const getCart = () => api.get('/cart');
export const addItem = (productId, quantity = 1) => api.post('/cart', { productId, quantity });
export const updateItem = (productId, quantity) => api.put(`/cart/${productId}`, { quantity });
export const removeItem = (productId) => api.delete(`/cart/${productId}`);
export const clearCart = () => api.delete('/cart');