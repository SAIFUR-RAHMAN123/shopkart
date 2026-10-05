import { Router } from 'express';
import { body, param } from 'express-validator';
import * as c from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();
router.use(protect);

const qty = (b) => b.isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10').toInt();
const productIdParam = param('productId').isMongoId().withMessage('Invalid product id');

router.get('/', c.getCart);
router.post('/', body('productId').isMongoId().withMessage('Valid productId is required'), qty(body('quantity').optional()), validate, c.addItem);
router.put('/:productId', productIdParam, qty(body('quantity')), validate, c.updateItem);
router.delete('/:productId', productIdParam, validate, c.removeItem);
router.delete('/', c.clearCart);

export default router;