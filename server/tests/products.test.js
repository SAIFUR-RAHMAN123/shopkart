import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Product from '../models/Product.js';
import { api, auth, connectTestDb, disconnectDb, resetDb, createUser, makeCategory, makeProduct } from './helpers.js';

describe('Products', () => {
  let adminToken, userToken, phones, laptops, phone, laptop;

  before(connectTestDb);
  after(disconnectDb);
  beforeEach(async () => {
    await resetDb();
    adminToken = (await createUser({ role: 'admin' })).token;
    userToken = (await createUser()).token;
    phones = await makeCategory('Mobiles');
    laptops = await makeCategory('Laptops');
    phone = await makeProduct(phones, { name: 'Alpha Phone', price: 10000, discount: 10, brand: 'Alpha', rating: 4.5, numReviews: 100 });
    laptop = await makeProduct(laptops, { name: 'Beta Laptop', price: 50000, discount: 0, brand: 'Beta', rating: 4, numReviews: 10 });
  });

  describe('listing', () => {
    it('returns active products with pagination info', async () => {
      const res = await api().get('/api/products');
      assert.equal(res.status, 200);
      assert.equal(res.body.pagination.total, 2);
    });

    it('searches by name and by brand', async () => {
      const byName = await api().get('/api/products?search=alpha');
      assert.deepEqual(byName.body.products.map((p) => p.name), ['Alpha Phone']);
      const byBrand = await api().get('/api/products?search=beta');
      assert.deepEqual(byBrand.body.products.map((p) => p.name), ['Beta Laptop']);
    });

    it('filters by category slug, price range and rating', async () => {
      assert.equal((await api().get('/api/products?category=laptops')).body.pagination.total, 1);
      const min = await api().get('/api/products?minPrice=20000');
      assert.deepEqual(min.body.products.map((p) => p.name), ['Beta Laptop']);
      const max = await api().get('/api/products?maxPrice=20000');
      assert.deepEqual(max.body.products.map((p) => p.name), ['Alpha Phone']);
      const rated = await api().get('/api/products?minRating=4.5');
      assert.deepEqual(rated.body.products.map((p) => p.name), ['Alpha Phone']);
    });

    it('sorts by final price', async () => {
      const asc = await api().get('/api/products?sort=price_asc');
      assert.equal(asc.body.products[0].name, 'Alpha Phone');
      const desc = await api().get('/api/products?sort=price_desc');
      assert.equal(desc.body.products[0].name, 'Beta Laptop');
    });

    it('paginates', async () => {
      const res = await api().get('/api/products?limit=1&page=2');
      assert.equal(res.body.products.length, 1);
      assert.equal(res.body.pagination.pages, 2);
    });

    it('ignores non-string query values instead of treating them as operators', async () => {
      const res = await api().get('/api/products?category[$ne]=laptops');
      assert.equal(res.status, 200);
      assert.equal(res.body.pagination.total, 2);
    });

    it('hides inactive products', async () => {
      await Product.updateOne({ _id: phone._id }, { isActive: false });
      assert.equal((await api().get('/api/products')).body.pagination.total, 1);
      assert.equal((await api().get(`/api/products/${phone.slug}`)).status, 404);
    });
  });

  describe('details', () => {
    it('finds a product by slug and by id', async () => {
      const bySlug = await api().get(`/api/products/${phone.slug}`);
      assert.equal(bySlug.status, 200);
      assert.equal(bySlug.body.product.category.name, 'Mobiles');
      assert.equal((await api().get(`/api/products/${phone._id}`)).status, 200);
    });

    it('returns 404 for an unknown product', async () => {
      assert.equal((await api().get('/api/products/does-not-exist')).status, 404);
    });
  });

  describe('admin CRUD', () => {
    const newProduct = () => ({
      name: 'New Tablet',
      description: 'Nice tablet',
      price: 2000,
      discount: 25,
      category: String(phones._id),
      brand: 'Gamma',
      images: ['https://example.com/t.jpg'],
      stock: 5,
    });

    it('rejects anonymous (401) and non-admin (403) writes', async () => {
      assert.equal((await api().post('/api/products').send(newProduct())).status, 401);
      assert.equal((await api().post('/api/products').set(auth(userToken)).send(newProduct())).status, 403);
    });

    it('creates a product, computes finalPrice and ignores protected fields', async () => {
      const res = await api().post('/api/products').set(auth(adminToken)).send({ ...newProduct(), rating: 5, finalPrice: 1 });
      assert.equal(res.status, 201);
      assert.equal(res.body.product.finalPrice, 1500);
      assert.equal(res.body.product.rating, 0);
    });

    it('validates input', async () => {
      const empty = await api().post('/api/products').set(auth(adminToken)).send({});
      assert.equal(empty.status, 400);
      assert.ok(empty.body.errors.length > 0);
      const noCat = await api().post('/api/products').set(auth(adminToken)).send({ ...newProduct(), category: '64b64c4f1f1f1f1f1f1f1f1f' });
      assert.equal(noCat.status, 400);
    });

    it('updates a product and recomputes finalPrice', async () => {
      const res = await api().put(`/api/products/${phone._id}`).set(auth(adminToken)).send({ price: 4000, discount: 50 });
      assert.equal(res.status, 200);
      assert.equal(res.body.product.finalPrice, 2000);
    });

    it('deletes a product', async () => {
      assert.equal((await api().delete(`/api/products/${phone._id}`).set(auth(adminToken))).status, 200);
      assert.equal((await api().get(`/api/products/${phone._id}`)).status, 404);
    });
  });
});