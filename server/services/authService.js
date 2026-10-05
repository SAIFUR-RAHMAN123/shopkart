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
export const updateUserProfile = async (userId, { name, phone, address = {} }) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        name,
        phone: phone ?? '',
        address: {
          street: address.street ?? '',
          city: address.city ?? '',
          state: address.state ?? '',
          pincode: address.pincode ?? '',
        },
      },
    },
    { new: true, runValidators: true }
  );
  return sanitize(user);
};

export const changeUserPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    // 400, not 401: a 401 would make the client log the user out
    throw new ApiError(400, 'Current password is incorrect');
  }
  user.password = newPassword; // hashed by the pre-save hook
  await user.save();
};