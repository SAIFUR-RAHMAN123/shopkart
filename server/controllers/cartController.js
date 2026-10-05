import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/cartService.js';

const send = (res, cart) => res.json({ success: true, cart });

export const getCart = asyncHandler(async (req, res) => send(res, await service.getCart(req.user._id)));

export const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  send(res, await service.addItem(req.user._id, productId, quantity));
});

export const updateItem = asyncHandler(async (req, res) =>
  send(res, await service.updateItem(req.user._id, req.params.productId, req.body.quantity))
);

export const removeItem = asyncHandler(async (req, res) =>
  send(res, await service.removeItem(req.user._id, req.params.productId))
);

export const clearCart = asyncHandler(async (req, res) => send(res, await service.clearCart(req.user._id)));