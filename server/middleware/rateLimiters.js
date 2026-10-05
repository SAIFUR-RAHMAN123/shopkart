import rateLimit from 'express-rate-limit';

const isProd = process.env.NODE_ENV === 'production';

const make = (limit, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    skip: () => process.env.NODE_ENV === 'test',
  });

export const apiLimiter = make(1000, 'Too many requests. Please slow down.');
export const authLimiter = make(isProd ? 20 : 200, 'Too many attempts. Please try again in 15 minutes.');