import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Category name is required'], unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    image: String,
  },
  { timestamps: true }
);

categorySchema.pre('validate', function () {
  if (!this.slug) this.slug = slugify(this.name);
});

export default mongoose.model('Category', categorySchema);