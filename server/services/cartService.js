import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';

const MAX_QUANTITY = 10;

const PRODUCT_FIELDS =
  'name slug brand images price discount finalPrice stock';

const populateCart = (cart) =>
  cart.populate('items.product', PRODUCT_FIELDS);

const buildSummary = (cart) => {
  let itemCount = 0;
  let subtotal = 0;
  let discount = 0;

  for (const item of cart.items) {
    const product = item.product;

    if (!product) continue;

    const quantity = item.quantity;

    itemCount += quantity;

    subtotal += (product.price || 0) * quantity;

    discount +=
      ((product.price || 0) - (product.finalPrice || product.price || 0)) *
      quantity;
  }

  const total = subtotal - discount;

  return {
    itemCount,
    subtotal,
    discount,
    total,
  };
};

const formatCart = (cart) => {
  const summary = buildSummary(cart);

  return {
    ...cart.toObject(),
    summary,
  };
};

export const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  await populateCart(cart);

  return formatCart(cart);
};

export const addItem = async (userId, productId, quantity = 1) => {
  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (product.stock < 1) {
    throw new ApiError(400, 'Product is out of stock');
  }

  const qty = Number(quantity);

  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
    throw new ApiError(400, 'Quantity must be between 1 and 10');
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [],
    });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  const maxQuantity = Math.min(product.stock, MAX_QUANTITY);

  if (existingItem) {
    const newQuantity = existingItem.quantity + qty;

    if (newQuantity > maxQuantity) {
      throw new ApiError(
        400,
        `Only ${maxQuantity} left in stock`
      );
    }

    existingItem.quantity = newQuantity;
  } else {
    if (qty > maxQuantity) {
      throw new ApiError(
        400,
        `Maximum available quantity is ${maxQuantity}`
      );
    }

    cart.items.push({
      product: productId,
      quantity: qty,
    });
  }

  await cart.save();
  await populateCart(cart);

  return formatCart(cart);
};

export const updateItem = async (userId, productId, quantity) => {
  const qty = Number(quantity);

  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
    throw new ApiError(400, 'Quantity must be between 1 and 10');
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const maxQuantity = Math.min(product.stock, MAX_QUANTITY);

  if (qty > maxQuantity) {
    throw new ApiError(
      400,
      `Only ${maxQuantity} left in stock`
    );
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const item = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (!item) {
    throw new ApiError(404, 'Product is not in cart');
  }

  item.quantity = qty;

  await cart.save();
  await populateCart(cart);

  return formatCart(cart);
};

export const removeItem = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const originalLength = cart.items.length;

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  if (cart.items.length === originalLength) {
    throw new ApiError(404, 'Product is not in cart');
  }

  await cart.save();
  await populateCart(cart);

  return formatCart(cart);
};

export const clearCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  } else {
    cart.items = [];
    await cart.save();
  }

  await populateCart(cart);

  return formatCart(cart);
};