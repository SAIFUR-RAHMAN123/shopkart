import asyncHandler from '../utils/asyncHandler.js';
import { registerUser, loginUser } from '../services/authService.js';

export const register = asyncHandler(async (req, res) => {
  const data = await registerUser(req.body);
  res.status(201).json({ success: true, ...data });
});

export const login = asyncHandler(async (req, res) => {
  const data = await loginUser(req.body);
  res.json({ success: true, ...data });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});