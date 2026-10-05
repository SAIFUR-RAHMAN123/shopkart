import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const listUsers = async (q) => {
  const page = Math.max(parseInt(q.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(q.limit) || 10, 1), 50);
  const filter = {};

  if (str(q.search)) {
    const rx = new RegExp(escapeRegex(str(q.search)), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  if (str(q.status) === 'active') filter.isActive = true;
  if (str(q.status) === 'inactive') filter.isActive = false;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('name email role isActive createdAt')
      .sort({ createdAt: -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const setUserActive = async (id, isActive) => {
  const user = await User.findById(id).select('name email role isActive');
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'admin') throw new ApiError(403, 'Admin accounts cannot be modified here');

  user.isActive = isActive;
  await user.save();
  return user;
};