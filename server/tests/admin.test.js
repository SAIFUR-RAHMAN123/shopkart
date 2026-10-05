import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { api, auth, orderFor, connectTestDb, disconnectDb, resetDb, createUser, makeCategory, makeProduct } from './helpers.js';

describe('Admin', () => {
  let admin, adminToken, user, userToken, product;
  const setStatus = (orderId, status) =>
    api().put(`/api/admin/orders/${orderId}/status`).set(auth(adminToken)).send({ status });

  before(connectTestDb);
  after(disconnectDb);
  beforeEach(async () => {
    await resetDb();
    ({ user: admin, token: adminToken } = await createUser({ role: 'admin' }));
    ({ user, token: userToken } = await createUser());
    product = await makeProduct(await makeCategory(), { price: 10000, discount: 10, stock: 10 });
  });

  for (const path of ['/api/admin/stats', '/api/admin/orders', '/api/admin/users', '/api/admin/products']) {
    it(`${path}: 401 anonymous, 403 normal user, 200 admin`, async () => {
      assert.equal((await api().get(path)).status, 401);
      assert.equal((await api().get(path).set(auth(userToken))).status, 403);
      assert.equal((await api().get(path).set(auth(adminToken))).status, 200);
    });
  }

  it('reports dashboard stats', async () => {
    await orderFor(userToken, product._id);
    const { stats } = (await api().get('/api/admin/stats').set(auth(adminToken))).body;
    assert.equal(stats.totalUsers, 1);
    assert.equal(stats.totalProducts, 1);
    assert.equal(stats.totalOrders, 1);
    assert.equal(stats.pendingOrders, 1);
    assert.equal(stats.totalRevenue, 9000);
    assert.equal(stats.recentOrders.length, 1);
  });

  it('lists orders with filters', async () => {
    await orderFor(userToken, product._id);
    const pending = await api().get('/api/admin/orders?status=Pending').set(auth(adminToken));
    assert.equal(pending.body.pagination.total, 1);
    const delivered = await api().get('/api/admin/orders?status=Delivered').set(auth(adminToken));
    assert.equal(delivered.body.pagination.total, 0);
    const byEmail = await api().get(`/api/admin/orders?search=${encodeURIComponent(user.email)}`).set(auth(adminToken));
    assert.equal(byEmail.body.pagination.total, 1);
  });

  it('walks an order through the allowed status flow and marks COD as paid on delivery', async () => {
    const order = await orderFor(userToken, product._id);
    const flow = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
    for (const status of flow) {
      const res = await setStatus(order._id, status);
      assert.equal(res.status, 200, `moving to ${status}`);
      assert.equal(res.body.order.status, status);
    }
    const final = await Order.findById(order._id);
    assert.equal(final.paymentStatus, 'paid');
    assert.ok(final.deliveredAt);
    assert.deepEqual(final.statusHistory.map((h) => h.status), ['Pending', ...flow]);
  });

  it('rejects invalid transitions and invalid status values', async () => {
    const order = await orderFor(userToken, product._id);
    assert.equal((await setStatus(order._id, 'Delivered')).status, 400); // skipping steps
    assert.equal((await setStatus(order._id, 'Foo')).status, 400);

    await setStatus(order._id, 'Cancelled');
    assert.equal((await setStatus(order._id, 'Confirmed')).status, 400); // cancelled is final
  });

  it('restocks when an admin cancels an order', async () => {
    const order = await orderFor(userToken, product._id, 3);
    assert.equal((await Product.findById(product._id)).stock, 7);
    assert.equal((await setStatus(order._id, 'Cancelled')).status, 200);
    assert.equal((await Product.findById(product._id)).stock, 10);
  });

  it('only lets admins change order status', async () => {
    const order = await orderFor(userToken, product._id);
    const res = await api().put(`/api/admin/orders/${order._id}/status`).set(auth(userToken)).send({ status: 'Confirmed' });
    assert.equal(res.status, 403);
  });

  it('deactivates a user, whose existing token then stops working', async () => {
    const res = await api().put(`/api/admin/users/${user._id}/status`).set(auth(adminToken)).send({ isActive: false });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.isActive, false);
    assert.equal((await api().get('/api/auth/me').set(auth(userToken))).status, 401);
  });

  it('refuses to modify admin accounts', async () => {
    const res = await api().put(`/api/admin/users/${admin._id}/status`).set(auth(adminToken)).send({ isActive: false });
    assert.equal(res.status, 403);
  });
});