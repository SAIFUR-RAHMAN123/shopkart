import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/orderService.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  const order = await service.createOrder(req.user._id, { shippingAddress, paymentMethod });
  res.status(201).json({ success: true, order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  res.json({ success: true, orders: await service.getMyOrders(req.user._id) });
});

export const getOrder = asyncHandler(async (req, res) => {
  res.json({ success: true, order: await service.getMyOrder(req.user._id, req.params.id) });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  res.json({ success: true, order: await service.cancelOrder(req.user._id, req.params.id) });
});