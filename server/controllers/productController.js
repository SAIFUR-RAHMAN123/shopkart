import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/productService.js';

export const getProducts = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await service.listProducts(req.query)) });
});

export const getFilterOptions = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await service.getFilterOptions()) });
});

export const getProduct = asyncHandler(async (req, res) => {
  res.json({ success: true, product: await service.getProduct(req.params.idOrSlug) });
});

export const createProduct = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, product: await service.createProduct(req.body) });
});

export const updateProduct = asyncHandler(async (req, res) => {
  res.json({ success: true, product: await service.updateProduct(req.params.id, req.body) });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await service.deleteProduct(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});