import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import generateToken from '../utils/generateToken.js';

const sanitize = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address,
});

export const registerUser = async ({ name, email, password }) => {
  if (await User.findOne({ email })) throw new ApiError(409, 'Email already registered');
  const user = await User.create({ name, email, password });
  return { user: sanitize(user), token: generateToken(user._id) };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) throw new ApiError(403, 'Account is deactivated');
  return { user: sanitize(user), token: generateToken(user._id) };
};