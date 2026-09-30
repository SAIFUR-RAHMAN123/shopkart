import 'dotenv/config';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import slugify from '../utils/slugify.js';

const CATEGORY_MAP = {
  Mobiles: ['smartphones'],
  Laptops: ['laptops'],
  Electronics: ['tablets', 'mobile-accessories'],
  Fashion: ['mens-shirts', 'womens-dresses', 'tops'],
  Shoes: ['mens-shoes', 'womens-shoes'],
  Watches: ['mens-watches', 'womens-watches'],
  'Home & Kitchen': ['kitchen-accessories', 'furniture', 'home-decoration'],
  Accessories: ['sunglasses', 'womens-bags', 'womens-jewellery'],
};
const PER_SOURCE_LIMIT = 10;
const USD_TO_INR = 83;

const res = await fetch('https://dummyjson.com/products?limit=0');
if (!res.ok) throw new Error(`DummyJSON request failed: ${res.status}`);
const { products: source } = await res.json();

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([Product.deleteMany(), Category.deleteMany()]); // dev only: wipes existing data

const usedSlugs = new Set();
const docs = [];
let categoryCount = 0;

for (const [catName, sources] of Object.entries(CATEGORY_MAP)) {
  const items = sources.flatMap((s) => source.filter((p) => p.category === s).slice(0, PER_SOURCE_LIMIT));
  if (!items.length) continue;

  const category = await Category.create({ name: catName, image: items[0].thumbnail });
  categoryCount++;

  for (const p of items) {
    let slug = slugify(p.title);
    for (let n = 2; usedSlugs.has(slug); n++) slug = `${slugify(p.title)}-${n}`;
    usedSlugs.add(slug);

    docs.push({
      name: p.title,
      slug,
      description: p.description,
      price: Math.round((p.price * USD_TO_INR) / 10) * 10,
      discount: Math.min(Math.round(p.discountPercentage), 90),
      category: category._id,
      brand: p.brand || 'ShopKart Basics',
      images: [...new Set([p.thumbnail, ...p.images])],
      rating: Math.round(p.rating * 10) / 10,
      numReviews: 20 + ((p.id * 37) % 480), // deterministic, gives popularity sort real spread
      stock: p.stock,
      featured: p.rating >= 4.5,
      specifications: [
        ['Warranty', p.warrantyInformation],
        ['Shipping', p.shippingInformation],
        ['Return policy', p.returnPolicy],
        ['SKU', p.sku],
      ]
        .filter(([, v]) => v)
        .map(([key, value]) => ({ key, value })),
    });
  }
}

await Product.insertMany(docs);
console.log(`Seeded ${categoryCount} categories, ${docs.length} products (${docs.filter((d) => d.featured).length} featured)`);
await mongoose.disconnect();