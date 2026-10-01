import api from './api';

export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (idOrSlug) => api.get(`/products/${idOrSlug}`);
export const getProductFilters = (params) => api.get('/products/filters', { params });