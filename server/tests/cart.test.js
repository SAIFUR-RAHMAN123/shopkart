import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Product from '../models/Product.js';
import { api, auth, addToCart, connectTestDb, disconnectDb, resetDb, createUser, makeCategory, makeProduct } from './helpers.js';

describe('Cart', () => {
  let token, product;

  before(connectTestDb);
  after(disconnectDb);
  beforeEach(async () => {
    await resetDb();
    ({ token } = await createUser());
    product = await makeProduct(await makeCategory(), { price: 10000, discount: 10, stock: 5 });
  });

  it('requires authentication', async () => {
    assert.equal((await api().get('/api/cart')).status, 401);
  });

  it('starts empty', async () => {
    const res = await api().get('/api/cart').set(auth(token));
    assert.deepEqual(res.body.cart.items, []);
    assert.equal(res.body.cart.summary.total, 0);
  });

  it('adds an item and calculates subtotal, discount and total', async () => {
    const res = await addToCart(token, product._id, 2);
    assert.equal(res.status, 200);
    assert.equal(res.body.cart.items.length, 1);
    assert.deepEqual(res.body.cart.summary, { itemCount: 2, subtotal: 20000, total: 18000, discount: 2000 });
  });

  it('increments quantity when the same product is added again', async () => {
    await addToCart(token, product._id, 1);
    const res = await addToCart(token, product._id, 1);
    assert.equal(res.body.cart.items.length, 1);
    assert.equal(res.body.cart.items[0].quantity, 2);
  });

  it('enforces stock', async () => {
    const tooMany = await addToCart(token, product._id, 6);
    assert.equal(tooMany.status, 400);
    assert.equal(tooMany.body.message, 'Only 5 left in stock');

    await addToCart(token, product._id, 3);
    assert.equal((await addToCart(token, product._id, 3)).status, 400); // 3 + 3 > 5
  });

  it('validates quantity and product id', async () => {
    assert.equal((await addToCart(token, product._id, 11)).status, 400);
    assert.equal((await api().post('/api/cart').set(auth(token)).send({ productId: 'abc' })).status, 400);
  });

  it('rejects inactive products', async () => {
    await Product.updateOne({ _id: product._id }, { isActive: false });
    assert.equal((await addToCart(token, product._id)).status, 404);
  });

  it('updates quantity within stock', async () => {
    await addToCart(token, product._id, 1);
    const ok = await api().put(`/api/cart/${product._id}`).set(auth(token)).send({ quantity: 4 });
    assert.equal(ok.body.cart.items[0].quantity, 4);
    const over = await api().put(`/api/cart/${product._id}`).set(auth(token)).send({ quantity: 6 });
    assert.equal(over.status, 400);
  });

  it('returns 404 when updating an item that is not in the cart', async () => {
    const res = await api().put(`/api/cart/${product._id}`).set(auth(token)).send({ quantity: 2 });
    assert.equal(res.status, 404);
  });

  it('removes an item and clears the cart', async () => {
    await addToCart(token, product._id, 2);
    const removed = await api().delete(`/api/cart/${product._id}`).set(auth(token));
    assert.equal(removed.body.cart.items.length, 0);

    await addToCart(token, product._id, 1);
    const cleared = await api().delete('/api/cart').set(auth(token));
    assert.equal(cleared.body.cart.summary.itemCount, 0);
  });

  it('keeps carts separate per user', async () => {
    await addToCart(token, product._id, 1);
    const other = await createUser();
    const res = await api().get('/api/cart').set(auth(other.token));
    assert.equal(res.body.cart.items.length, 0);
  });
});