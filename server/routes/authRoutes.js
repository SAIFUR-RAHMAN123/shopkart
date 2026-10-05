import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import validate from '../middleware/validate.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  [
    body('name').isString().trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isString().notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);

router.put(
  '/profile',
  protect,
  [
    body('name').isString().trim().notEmpty().withMessage('Name is required')
      .isLength({ max: 60 }).withMessage('Name is too long'),
    body('phone').optional({ values: 'falsy' }).matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit mobile number'),
    body('address.street').optional().isString().trim().isLength({ max: 200 }).withMessage('Address is too long'),
    body('address.city').optional().isString().trim().isLength({ max: 60 }).withMessage('City is too long'),
    body('address.state').optional().isString().trim().isLength({ max: 60 }).withMessage('State is too long'),
    body('address.pincode').optional({ values: 'falsy' }).matches(/^\d{6}$/).withMessage('Enter a valid 6-digit pincode'),
  ],
  validate,
  updateProfile
);

router.put(
  '/password',
  protect,
  authLimiter,
  [
    body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
    body('newPassword').isString().isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
      .custom((v, { req }) => v !== req.body.currentPassword).withMessage('New password must be different'),
  ],
  validate,
  changePassword
);

export default router;