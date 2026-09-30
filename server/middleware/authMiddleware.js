import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new ApiError(401, 'Not authenticated');

  const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new ApiError(401, 'User no longer exists or is deactivated');

  req.user = user;
  next();
});

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return next(new ApiError(403, 'Admin access required'));
  next();
};