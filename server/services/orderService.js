import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Order, { ORDER_STATUSES } from '../models/Order.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';

export const restockItems = (items, session) =>
  Product.bulkWrite(
    items.map((i) => ({ updateOne: { filter: { _id: i.product }, update: { $inc: { stock: i.quantity } } } })),
    { session }
  );

export const createOrder = async (userId, { shippingAddress, paymentMethod }) => {
  const session = await mongoose.startSession();
  try {
    let order;
    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ user: userId }).session(session);
      if (!cart || !cart.items.length) throw new ApiError(400, 'Your cart is empty');

      const products = await Product.find({
        _id: { $in: cart.items.map((i) => i.product) },
        isActive: true,
      }).session(session);
      const byId = new Map(products.map((p) => [String(p._id), p]));

      // Snapshot name/image/prices from the DB, never from the client
      const items = cart.items.map(({ product, quantity }) => {
        const p = byId.get(String(product));
        if (!p) throw new ApiError(400, 'Some items in your cart are no longer available. Please review your cart.');
        return {
          product: p._id,
          name: p.name,
          image: p.images[0],
          price: p.price,
          discount: p.discount,
          finalPrice: p.finalPrice,
          quantity,
        };
      });

      // Atomic stock decrement: fails if stock dropped since the cart was built
      for (const item of items) {
        const { modifiedCount } = await Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session }
        );
        if (!modifiedCount) throw new ApiError(400, `"${item.name}" does not have enough stock`);
      }

      const itemsPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const totalPrice = items.reduce((s, i) => s + i.finalPrice * i.quantity, 0);
      const isDemo = paymentMethod === 'demo';

      [order] = await Order.create(
        [
          {
            user: userId,
            items,
            shippingAddress,
            paymentMethod,
            paymentStatus: isDemo ? 'paid' : 'pending',
            paidAt: isDemo ? new Date() : undefined,
            itemsPrice,
            discount: itemsPrice - totalPrice,
            totalPrice,
            statusHistory: [{ status: 'Pending' }],
          },
        ],
        { session }
      );

      cart.items = [];
      await cart.save({ session });
    });
    return order;
  } finally {
    await session.endSession();
  }
};

export const getMyOrders = (userId) => Order.find({ user: userId }).sort({ createdAt: -1 }).limit(100);

export const getMyOrder = async (userId, orderId) => {
  // Filtering by user means other people's orders return 404, not 403
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
};

export const cancelOrder = async (userId, orderId) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const order = await Order.findOne({ _id: orderId, user: userId }).session(session);
      if (!order) throw new ApiError(404, 'Order not found');
      if (!['Pending', 'Confirmed'].includes(order.status)) {
        throw new ApiError(400, `A ${order.status.toLowerCase()} order cannot be cancelled`);
      }

      await restockItems(order.items, session);
      order.status = 'Cancelled';
      order.statusHistory.push({ status: 'Cancelled' });
      if (order.paymentStatus === 'paid') order.paymentStatus = 'refunded';
      result = await order.save({ session });
    });
    return result;
  } finally {
    await session.endSession();
  }
};
const TRANSITIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const adminListOrders = async (q) => {
  const page = Math.max(parseInt(q.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(q.limit) || 10, 1), 50);
  const filter = {};

  if (ORDER_STATUSES.includes(str(q.status))) filter.status = str(q.status);

  const search = str(q.search);
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    const users = await User.find({ $or: [{ name: rx }, { email: rx }] }).select('_id').limit(100);
    const or = [{ user: { $in: users.map((u) => u._id) } }];
    // Short order id (last hex chars of the _id, as shown in the UI)
    if (/^[a-f\d]{4,24}$/i.test(search)) {
      or.push({ $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: `${search}$`, options: 'i' } } });
    }
    filter.$or = or;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .select('-statusHistory -shippingAddress')
      .populate('user', 'name email')
      .sort({ createdAt: -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const adminGetOrder = async (id) => {
  const order = await Order.findById(id).populate('user', 'name email phone');
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
};

export const updateOrderStatus = async (orderId, status) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new ApiError(404, 'Order not found');
      if (!TRANSITIONS[order.status].includes(status)) {
        throw new ApiError(400, `Cannot change status from ${order.status} to ${status}`);
      }

      if (status === 'Cancelled') {
        await restockItems(order.items, session);
        if (order.paymentStatus === 'paid') order.paymentStatus = 'refunded';
      }
      if (status === 'Delivered') {
        order.deliveredAt = new Date();
        if (order.paymentStatus === 'pending') {
          order.paymentStatus = 'paid'; // COD collected on delivery
          order.paidAt = new Date();
        }
      }

      order.status = status;
      order.statusHistory.push({ status });
      result = await order.save({ session });
    });
    return result;
  } finally {
    await session.endSession();
  }
};