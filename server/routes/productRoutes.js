import { Router } from 'express';
import { body } from 'express-validator';
import * as c from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();

const productRules = (partial = false) => {
  const f = (field) => (partial ? body(field).optional() : body(field));
  return [
    f('name').trim().notEmpty().withMessage('Name is required'),
    f('description').trim().notEmpty().withMessage('Description is required'),
    f('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('discount').optional().isFloat({ min: 0, max: 90 }).withMessage('Discount must be 0-90'),
    f('category').isMongoId().withMessage('Valid category is required'),
    f('brand').trim().notEmpty().withMessage('Brand is required'),
    f('images').isArray({ min: 1 }).withMessage('At least one image is required'),
    body('images.*').optional().isURL().withMessage('Each image must be a valid URL'),
    f('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ];
};

router.get('/', c.getProducts);
router.get('/filters', c.getFilterOptions); // must stay above /:idOrSlug
router.get('/:idOrSlug', c.getProduct);

router.post('/', protect, adminOnly, productRules(), validate, c.createProduct);
router.put('/:id', protect, adminOnly, productRules(true), validate, c.updateProduct);
router.delete('/:id', protect, adminOnly, c.deleteProduct);

export default router;