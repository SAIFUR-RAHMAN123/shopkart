import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import User from '../models/User.js';
import { api, auth, connectTestDb, disconnectDb, resetDb, createUser } from './helpers.js';

describe('Auth', () => {
  before(connectTestDb);
  after(disconnectDb);
  beforeEach(resetDb);

  const valid = { name: 'Asha', email: 'asha@example.com', password: 'secret123' };

  describe('register', () => {
    it('creates a user, hashes the password and returns a token', async () => {
      const res = await api().post('/api/auth/register').send(valid);
      assert.equal(res.status, 201);
      assert.ok(res.body.token);
      assert.equal(res.body.user.password, undefined);
      const stored = await User.findOne({ email: valid.email }).select('+password');
      assert.notEqual(stored.password, valid.password);
    });

    it('ignores a client-supplied role', async () => {
      const res = await api().post('/api/auth/register').send({ ...valid, role: 'admin' });
      assert.equal(res.body.user.role, 'user');
    });

    it('rejects a duplicate email with 409', async () => {
      await api().post('/api/auth/register').send(valid);
      const res = await api().post('/api/auth/register').send(valid);
      assert.equal(res.status, 409);
    });

    it('returns field errors for invalid input', async () => {
      const res = await api().post('/api/auth/register').send({ name: '', email: 'nope', password: '1' });
      assert.equal(res.status, 400);
      const fields = res.body.errors.map((e) => e.field);
      for (const f of ['name', 'email', 'password']) assert.ok(fields.includes(f), `missing error for ${f}`);
    });
  });

  describe('login', () => {
    it('logs in with correct credentials', async () => {
      const { email, password } = await createUser();
      const res = await api().post('/api/auth/login').send({ email, password });
      assert.equal(res.status, 200);
      assert.ok(res.body.token);
    });

    it('gives the same 401 for a wrong password and an unknown email', async () => {
      const { email } = await createUser();
      const wrongPass = await api().post('/api/auth/login').send({ email, password: 'wrong-pass' });
      const unknown = await api().post('/api/auth/login').send({ email: 'ghost@example.com', password: 'secret123' });
      assert.equal(wrongPass.status, 401);
      assert.equal(unknown.status, 401);
      assert.equal(wrongPass.body.message, unknown.body.message);
    });

    it('blocks deactivated accounts with 403', async () => {
      const { email, password } = await createUser({ isActive: false });
      const res = await api().post('/api/auth/login').send({ email, password });
      assert.equal(res.status, 403);
    });

    it('rejects an operator-injection payload', async () => {
      const res = await api().post('/api/auth/login').send({ email: { $gt: '' }, password: 'x' });
      assert.equal(res.status, 400);
    });
  });

  describe('GET /me', () => {
    it('requires a valid token', async () => {
      assert.equal((await api().get('/api/auth/me')).status, 401);
      assert.equal((await api().get('/api/auth/me').set(auth('garbage'))).status, 401);
    });

    it('returns the current user', async () => {
      const { token, email } = await createUser();
      const res = await api().get('/api/auth/me').set(auth(token));
      assert.equal(res.status, 200);
      assert.equal(res.body.user.email, email);
    });
  });

  describe('profile and password', () => {
    it('updates profile fields', async () => {
      const { token } = await createUser();
      const res = await api()
        .put('/api/auth/profile')
        .set(auth(token))
        .send({ name: 'New Name', phone: '9876543210', address: { city: 'Patna', pincode: '800001' } });
      assert.equal(res.status, 200);
      assert.equal(res.body.user.name, 'New Name');
      assert.equal(res.body.user.address.city, 'Patna');
    });

    it('rejects an invalid phone number', async () => {
      const { token } = await createUser();
      const res = await api().put('/api/auth/profile').set(auth(token)).send({ name: 'X', phone: '123' });
      assert.equal(res.status, 400);
    });

    it('rejects a wrong current password without logging the user out', async () => {
      const { token } = await createUser();
      const res = await api().put('/api/auth/password').set(auth(token)).send({ currentPassword: 'wrong', newPassword: 'newsecret1' });
      assert.equal(res.status, 400);
      assert.equal((await api().get('/api/auth/me').set(auth(token))).status, 200);
    });

    it('changes the password', async () => {
      const { token, email, password } = await createUser();
      const res = await api().put('/api/auth/password').set(auth(token)).send({ currentPassword: password, newPassword: 'newsecret1' });
      assert.equal(res.status, 200);
      assert.equal((await api().post('/api/auth/login').send({ email, password: 'newsecret1' })).status, 200);
      assert.equal((await api().post('/api/auth/login').send({ email, password })).status, 401);
    });
  });
});