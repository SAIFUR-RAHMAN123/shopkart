import { Router } from 'express';
import { body, param } from 'express-validator';

import {
  getStats,
  listProducts,
  getProduct,
  listOrders,
  getOrder,
  updateOrderStatus,
  listUsers,
  setUserStatus,
} from '../controllers/adminController.js';

import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { ORDER_STATUSES } from '../models/Order.js';
import validate from '../middleware/validate.js';

const router = Router();

// Every /api/admin/* route is admin-only
router.use(protect, adminOnly);

// Dashboard
router.get('/stats', getStats);

// Products
router.get('/products', listProducts);

router.get(
  '/products/:id',
  param('id').isMongoId().withMessage('Invalid product id'),
  validate,
  getProduct
);

// Orders
const idParam = param('id').isMongoId().withMessage('Invalid id');

router.get('/orders', listOrders);

router.get(
  '/orders/:id',
  idParam,
  validate,
  getOrder
);

router.put(
  '/orders/:id/status',
  idParam,
  body('status')
    .isIn(ORDER_STATUSES)
    .withMessage('Invalid status'),
  validate,
  updateOrderStatus
);

// Users
router.get('/users', listUsers);

router.put(
  '/users/:id/status',
  idParam,
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be true or false')
    .toBoolean(),
  validate,
  setUserStatus
);

export default router;