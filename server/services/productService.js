import Product from '../models/Product.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';

const SORTS = {
  price_asc: { finalPrice: 1 },
  price_desc: { finalPrice: -1 },
  rating: { rating: -1, numReviews: -1 },
  newest: { createdAt: -1 },
  popularity: { numReviews: -1, rating: -1 },
};

const ALLOWED = [
  'name',
  'description',
  'price',
  'discount',
  'category',
  'brand',
  'images',
  'stock',
  'specifications',
  'featured',
  'isActive',
];

// Query values must be plain strings
// Blocks ?category[$ne]=x style injection
const str = (v) => (typeof v === 'string' ? v.trim() : '');

const list = (v) =>
  str(v)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const num = (v) =>
  str(v) && Number.isFinite(Number(v)) ? Number(v) : undefined;

const escapeRegex = (s) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const pick = (obj, keys) =>
  Object.fromEntries(
    keys
      .filter((k) => obj[k] !== undefined)
      .map((k) => [k, obj[k]])
  );

const assertCategory = async (id) => {
  if (id && !(await Category.exists({ _id: id }))) {
    throw new ApiError(400, 'Category does not exist');
  }
};

// Shared by product listing and filter options.
// Search/category filters are applied first so that
// brand and price facets match the current results.
const baseFilter = async (q = {}) => {
  const filter = { isActive: true };

  if (str(q.search)) {
    const rx = new RegExp(escapeRegex(str(q.search)), 'i');

    filter.$or = [
      { name: rx },
      { brand: rx },
    ];
  }

  const slugs = list(q.category);

  if (slugs.length) {
    const cats = await Category.find({
      slug: { $in: slugs },
    }).select('_id');

    filter.category = {
      $in: cats.map((c) => c._id),
    };
  }

  return filter;
};

export const listProducts = async (q = {}) => {
  const page = Math.max(parseInt(q.page) || 1, 1);

  const limit = Math.min(
    Math.max(parseInt(q.limit) || 12, 1),
    50
  );

  // Base filter contains active + search + category
  const filter = await baseFilter(q);

  // Brand filter
  const brands = list(q.brand);

  if (brands.length) {
    filter.brand = { $in: brands };
  }

  // Price filter
  const minPrice = num(q.minPrice);
  const maxPrice = num(q.maxPrice);

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.finalPrice = {
      ...(minPrice !== undefined && { $gte: minPrice }),
      ...(maxPrice !== undefined && { $lte: maxPrice }),
    };
  }

  // Rating filter
  if (num(q.minRating) !== undefined) {
    filter.rating = {
      $gte: num(q.minRating),
    };
  }

  // Discount filter
  if (num(q.minDiscount) !== undefined) {
    filter.discount = {
      $gte: num(q.minDiscount),
    };
  }

  // Featured products
  if (str(q.featured) === 'true') {
    filter.featured = true;
  }

  const sort = {
    ...(SORTS[str(q.sort)] || SORTS.newest),
    _id: 1,
  };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select('-description -specifications -__v')
      .populate('category', 'name slug')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getFilterOptions = async (q = {}) => {
  // Apply current search + category
  const match = await baseFilter(q);

  const [brands, price] = await Promise.all([
    Product.distinct('brand', match),

    Product.aggregate([
      { $match: match },

      {
        $group: {
          _id: null,
          min: { $min: '$finalPrice' },
          max: { $max: '$finalPrice' },
        },
      },
    ]),
  ]);

  return {
    brands: brands.sort(),
    minPrice: price[0]?.min ?? 0,
    maxPrice: price[0]?.max ?? 0,
  };
};

export const getProduct = async (idOrSlug) => {
  const query = /^[a-f\d]{24}$/i.test(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  const product = await Product.findOne({
    ...query,
    isActive: true,
  }).populate('category', 'name slug');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return product;
};

export const createProduct = async (body) => {
  const data = pick(body, ALLOWED);

  // Validate category
  await assertCategory(data.category);

  return Product.create(data);
};

export const updateProduct = async (id, body) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const data = pick(body, ALLOWED);

  await assertCategory(data.category);

  Object.assign(product, data);

  // save() so finalPrice is recomputed
  return product.save();
};

export const deleteProduct = async (id) => {
  if (!(await Product.findByIdAndDelete(id))) {
    throw new ApiError(404, 'Product not found');
  }
};

export const adminListProducts = async (q) => {
  const page = Math.max(parseInt(q.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(q.limit) || 10, 1), 50);
  const filter = {}; // unlike the public list, includes inactive products

  if (str(q.search)) {
    const rx = new RegExp(escapeRegex(str(q.search)), 'i');
    filter.$or = [{ name: rx }, { brand: rx }];
  }
  if (/^[a-f\d]{24}$/i.test(str(q.category))) filter.category = str(q.category); // by category id
  if (str(q.status) === 'active') filter.isActive = true;
  if (str(q.status) === 'inactive') filter.isActive = false;
  if (str(q.stock) === 'low') filter.stock = { $lte: 5 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select('name slug images category brand price discount finalPrice stock isActive featured')
      .populate('category', 'name')
      .sort({ createdAt: -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const adminGetProduct = async (id) => {
  const product = await Product.findById(id).populate('category', 'name slug');
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};