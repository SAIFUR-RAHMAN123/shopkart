import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/adminService.js';

export const getStats = asyncHandler(async (req, res) => {
  res.json({ success: true, stats: await service.getDashboardStats() });
});

import * as productService from '../services/productService.js';

export const listProducts = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await productService.adminListProducts(req.query)) });
});

export const getProduct = asyncHandler(async (req, res) => {
  res.json({ success: true, product: await productService.adminGetProduct(req.params.id) });
});

import * as orderService from '../services/orderService.js';
import * as userService from '../services/userService.js';

export const listOrders = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await orderService.adminListOrders(req.query)) });
});

export const getOrder = asyncHandler(async (req, res) => {
  res.json({ success: true, order: await orderService.adminGetOrder(req.params.id) });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  res.json({ success: true, order: await orderService.updateOrderStatus(req.params.id, req.body.status) });
});

export const listUsers = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await userService.listUsers(req.query)) });
});

export const setUserStatus = asyncHandler(async (req, res) => {
  res.json({ success: true, user: await userService.setUserActive(req.params.id, req.body.isActive) });
});