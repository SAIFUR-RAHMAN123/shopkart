import { Router } from 'express';
import { body } from 'express-validator';
import * as c from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();
const nameRule = body('name').trim().notEmpty().withMessage('Category name is required');

router.get('/', c.getCategories);
router.post('/', protect, adminOnly, nameRule, validate, c.createCategory);
router.put('/:id', protect, adminOnly, c.updateCategory);
router.delete('/:id', protect, adminOnly, c.deleteCategory);

export default router;