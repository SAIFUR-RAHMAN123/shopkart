import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import generateToken from '../utils/generateToken.js';

export const api = () => request(app);
export const auth = (token) => ({ Authorization: `Bearer ${token}` });

export async function connectTestDb() {
  await mongoose.connect(process.env.MONGO_URI);
  const name = mongoose.connection.name;
  if (!name.endsWith('_test')) {
    await mongoose.disconnect();
    throw new Error(`Refusing to run tests against "${name}". Use a database whose name ends with _test.`);
  }
}
export const disconnectDb = () => mongoose.disconnect();
export const resetDb = () =>
  Promise.all(Object.values(mongoose.connection.models).map((m) => m.deleteMany({})));

let counter = 0;
export async function createUser({ role = 'user', ...overrides } = {}) {
  const data = {
    name: 'Test User',
    email: `user${++counter}_${Date.now()}@example.com`,
    password: 'secret123',
    ...overrides,
  };
  const user = await User.create({ ...data, role });
  return { user, token: generateToken(user._id), email: data.email, password: data.password };
}

export const makeCategory = (name = 'Mobiles') => Category.create({ name });

export const makeProduct = (category, overrides = {}) =>
  Product.create({
    name: 'Test Phone',
    description: 'A product used in tests',
    price: 10000,
    discount: 10, // finalPrice 9000
    category: category._id,
    brand: 'TestBrand',
    images: ['https://example.com/a.jpg'],
    stock: 10,
    ...overrides,
  });

export const address = {
  fullName: 'Test Buyer',
  phone: '9876543210',
  street: '12 MG Road',
  city: 'Patna',
  state: 'Bihar',
  pincode: '800001',
};

export const addToCart = (token, productId, quantity = 1) =>
  api().post('/api/cart').set(auth(token)).send({ productId: String(productId), quantity });

export const placeOrder = (token, paymentMethod = 'cod') =>
  api().post('/api/orders').set(auth(token)).send({ shippingAddress: address, paymentMethod });

export async function orderFor(token, productId, quantity = 1, paymentMethod = 'cod') {
  await addToCart(token, productId, quantity);
  const res = await placeOrder(token, paymentMethod);
  return res.body.order;
}