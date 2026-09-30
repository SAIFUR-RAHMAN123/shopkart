import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 200 },
    slug: { type: String, unique: true },
    description: { type: String, required: [true, 'Description is required'] },
    price: { type: Number, required: true, min: 0 }, // MRP
    discount: { type: Number, default: 0, min: 0, max: 90 }, // percent
    finalPrice: { type: Number },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    images: {
      type: [String],
      validate: [(v) => v.length > 0, 'At least one image is required'],
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    specifications: [{ _id: false, key: String, value: String }],
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ finalPrice: 1 });
productSchema.index({ createdAt: -1 });

productSchema.pre('validate', async function () {
  this.finalPrice = Math.round(this.price * (1 - this.discount / 100));
  if (!this.slug) {
    const base = slugify(this.name);
    let slug = base;
    let i = 1;
    while (await this.constructor.exists({ slug })) slug = `${base}-${++i}`;
    this.slug = slug;
  }
});

export default mongoose.model('Product', productSchema);