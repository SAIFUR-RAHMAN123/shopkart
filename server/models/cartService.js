import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';

const MAX_QTY = 10;

// Upsert avoids duplicate-cart races (e.g. double-click on first add)
const getCartDoc = (userId) =>
  Cart.findOneAndUpdate({ user: userId }, { $setOnInsert: { user: userId } }, { upsert: true, new: true });

const findProduct = async (id) => {
  const product = await Product.findOne({ _id: id, isActive: true });
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

const assertQty = (product, qty) => {
  if (product.stock < qty) {
    throw new ApiError(400, product.stock === 0 ? 'This product is out of stock' : `Only ${product.stock} left in stock`);
  }
  if (qty > MAX_QTY) throw new ApiError(400, `You can buy at most ${MAX_QTY} units of a product`);
};

const toView = async (cart) => {
  await cart.populate({
    path: 'items.product',
    select: 'name slug images brand price discount finalPrice stock isActive',
  });

  const items = cart.items
    .filter((i) => i.product && i.product.isActive) // drop deleted/deactivated products
    .map(({ product: p, quantity }) => ({
      product: {
        _id: p._id,
        name: p.name,
        slug: p.slug,
        image: p.images[0],
        brand: p.brand,
        price: p.price,
        discount: p.discount,
        finalPrice: p.finalPrice,
        stock: p.stock,
      },
      quantity,
      lineTotal: p.finalPrice * quantity,
      inStock: p.stock >= quantity,
    }));

  const summary = items.reduce(
    (acc, i) => {
      acc.itemCount += i.quantity;
      acc.subtotal += i.product.price * i.quantity;
      acc.total += i.lineTotal;
      return acc;
    },
    { itemCount: 0, subtotal: 0, total: 0 }
  );
  summary.discount = summary.subtotal - summary.total;

  return { items, summary };
};

export const getCart = async (userId) => toView(await getCartDoc(userId));

export const addItem = async (userId, productId, quantity = 1) => {
  const product = await findProduct(productId);
  const cart = await getCartDoc(userId);
  const existing = cart.items.find((i) => String(i.product) === productId);
  const newQty = (existing?.quantity || 0) + quantity;

  assertQty(product, newQty);
  if (existing) existing.quantity = newQty;
  else cart.items.push({ product: productId, quantity });

  await cart.save();
  return toView(cart);
};

export const updateItem = async (userId, productId, quantity) => {
  const cart = await getCartDoc(userId);
  const item = cart.items.find((i) => String(i.product) === productId);
  if (!item) throw new ApiError(404, 'Item not in cart');

  assertQty(await findProduct(productId), quantity);
  item.quantity = quantity;

  await cart.save();
  return toView(cart);
};

export const removeItem = async (userId, productId) => {
  const cart = await getCartDoc(userId);
  cart.items = cart.items.filter((i) => String(i.product) !== productId);
  await cart.save();
  return toView(cart);
};

export const clearCart = async (userId) => {
  const cart = await getCartDoc(userId);
  cart.items = [];
  await cart.save();
  return toView(cart);
};