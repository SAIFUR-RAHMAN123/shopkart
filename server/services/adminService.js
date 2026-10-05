import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const LOW_STOCK_THRESHOLD = 5;

export const getDashboardStats = async () => {
  const [totalUsers, totalProducts, totalOrders, pendingOrders, revenue, recentOrders, lowStockProducts] =
    await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('user totalPrice status createdAt')
        .populate('user', 'name email'),
      Product.find({ isActive: true, stock: { $lte: LOW_STOCK_THRESHOLD } })
        .sort({ stock: 1 })
        .limit(10)
        .select('name slug images stock'),
    ]);

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    pendingOrders,
    totalRevenue: revenue[0]?.total ?? 0,
    recentOrders,
    lowStockProducts,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
  };
};