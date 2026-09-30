import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getCategories = asyncHandler(async (req, res) => {
  res.json({ success: true, categories: await Category.find().sort('name') });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, image } = req.body;
  res.status(201).json({ success: true, category: await Category.create({ name, image }) });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  if (req.body.name) category.name = req.body.name;
  if (req.body.image !== undefined) category.image = req.body.image;
  res.json({ success: true, category: await category.save() });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  if (await Product.exists({ category: req.params.id })) {
    throw new ApiError(400, 'Category still has products. Move or delete them first.');
  }
  if (!(await Category.findByIdAndDelete(req.params.id))) throw new ApiError(404, 'Category not found');
  res.json({ success: true, message: 'Category deleted' });
});