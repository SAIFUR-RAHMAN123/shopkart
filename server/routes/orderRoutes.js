import { Router } from 'express';
import { body, param } from 'express-validator';
import * as c from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();
router.use(protect);

const notEmpty = (field, msg) => body(field).trim().notEmpty().withMessage(msg);
const idParam = param('id').isMongoId().withMessage('Invalid order id');

const orderRules = [
  notEmpty('shippingAddress.fullName', 'Full name is required'),
  body('shippingAddress.phone').matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit mobile number'),
  notEmpty('shippingAddress.street', 'Address is required'),
  notEmpty('shippingAddress.city', 'City is required'),
  notEmpty('shippingAddress.state', 'State is required'),
  body('shippingAddress.pincode').matches(/^\d{6}$/).withMessage('Enter a valid 6-digit pincode'),
  body('paymentMethod').isIn(['cod', 'demo']).withMessage('Select a valid payment method'),
];

router.post('/', orderRules, validate, c.createOrder);
router.get('/my-orders', c.getMyOrders); // keep above /:id
router.get('/:id', idParam, validate, c.getOrder);
router.put('/:id/cancel', idParam, validate, c.cancelOrder);

export default router;