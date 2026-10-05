import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { api, auth, address, addToCart, placeOrder, orderFor, connectTestDb, disconnectDb, resetDb, createUser, makeCategory, makeProduct } from './helpers.js';

describe('Orders', () => {
  let token, category, product;
  const stockOf = async (p) => (await Product.findById(p._id)).stock;

  before(connectTestDb);
  after(disconnectDb);
  beforeEach(async () => {
    await resetDb();
    ({ token } = await createUser());
    category = await makeCategory();
    product = await makeProduct(category, { price: 10000, discount: 10, stock: 10 });
  });

  it('requires authentication', async () => {
    assert.equal((await api().post('/api/orders').send({})).status, 401);
  });

  it('rejects an empty cart', async () => {
    const res = await placeOrder(token);
    assert.equal(res.status, 400);
    assert.equal(res.body.message, 'Your cart is empty');
  });

  it('validates shipping address and payment method', async () => {
    await addToCart(token, product._id);
    const badPhone = await api().post('/api/orders').set(auth(token)).send({ shippingAddress: { ...address, phone: '123' }, paymentMethod: 'cod' });
    assert.equal(badPhone.status, 400);
    assert.ok(badPhone.body.errors.some((e) => e.field === 'shippingAddress.phone'));
    const badPay = await api().post('/api/orders').set(auth(token)).send({ shippingAddress: address, paymentMethod: 'bitcoin' });
    assert.equal(badPay.status, 400);
  });

  it('places a COD order: totals, stock decrement, cart emptied', async () => {
    await addToCart(token, product._id, 2);
    const res = await placeOrder(token, 'cod');
    assert.equal(res.status, 201);
    const o = res.body.order;
    assert.equal(o.status, 'Pending');
    assert.equal(o.paymentStatus, 'pending');
    assert.equal(o.totalPrice, 18000);
    assert.equal(o.discount, 2000);
    assert.equal(o.items[0].quantity, 2);
    assert.equal(await stockOf(product), 8);

    const cart = await api().get('/api/cart').set(auth(token));
    assert.equal(cart.body.cart.items.length, 0);
  });

  it('marks demo payments as paid', async () => {
    await addToCart(token, product._id);
    const res = await placeOrder(token, 'demo');
    assert.equal(res.body.order.paymentStatus, 'paid');
    assert.ok(res.body.order.paidAt);
  });

  it('keeps the price snapshot when the product price changes later', async () => {
    const order = await orderFor(token, product._id);
    await Product.findById(product._id).then((p) => { p.price = 99999; return p.save(); });
    const res = await api().get(`/api/orders/${order._id}`).set(auth(token));
    assert.equal(res.body.order.items[0].finalPrice, 9000);
  });

  it('fails when stock dropped, leaving stock and cart untouched', async () => {
    await addToCart(token, product._id, 3);
    await Product.updateOne({ _id: product._id }, { stock: 1 });
    const res = await placeOrder(token);
    assert.equal(res.status, 400);
    assert.match(res.body.message, /does not have enough stock/);
    assert.equal(await stockOf(product), 1);
    const cart = await api().get('/api/cart').set(auth(token));
    assert.equal(cart.body.cart.items.length, 1);
  });

  it('is atomic: a failure on one item rolls back stock changes on the others', async () => {
    const second = await makeProduct(category, { name: 'Second Phone', stock: 5 });
    await addToCart(token, product._id, 1);
    await addToCart(token, second._id, 1);
    await Product.updateOne({ _id: second._id }, { stock: 0 });

    const res = await placeOrder(token);
    assert.equal(res.status, 400);
    assert.equal(await stockOf(product), 10); // first item's decrement was rolled back
    assert.equal(await Order.countDocuments(), 0);
  });

  it("lists only the user's own orders and hides other users' orders", async () => {
    const mine = await orderFor(token, product._id);
    const other = await createUser();
    await orderFor(other.token, product._id);

    const list = await api().get('/api/orders/my-orders').set(auth(token));
    assert.equal(list.body.orders.length, 1);
    assert.equal((await api().get(`/api/orders/${mine._id}`).set(auth(other.token))).status, 404);
  });

  it('cancels a pending order, restocks and refunds paid orders', async () => {
    const order = await orderFor(token, product._id, 2, 'demo');
    assert.equal(await stockOf(product), 8);
    const res = await api().put(`/api/orders/${order._id}/cancel`).set(auth(token));
    assert.equal(res.status, 200);
    assert.equal(res.body.order.status, 'Cancelled');
    assert.equal(res.body.order.paymentStatus, 'refunded');
    assert.equal(await stockOf(product), 10);
  });

  it('does not allow cancelling an order that has shipped', async () => {
    const order = await orderFor(token, product._id);
    await Order.updateOne({ _id: order._id }, { status: 'Shipped' });
    const res = await api().put(`/api/orders/${order._id}/cancel`).set(auth(token));
    assert.equal(res.status, 400);
  });
});