import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp([]);

describe('POST /auth/login', () => {
  it('rejects missing credentials', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('rejects wrong credentials', async () => {
    const res = await request(app).post('/auth/login').send({ username: 'admin', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('issues a token for correct credentials', async () => {
    const res = await request(app).post('/auth/login').send({ username: 'admin', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
  });
});

describe('protected routes', () => {
  it('rejects a request without a token', async () => {
    const res = await request(app).get('/api/sources');
    expect(res.status).toBe(401);
  });

  it('accepts a request with a valid token', async () => {
    const login = await request(app).post('/auth/login').send({ username: 'admin', password: 'password123' });
    const res = await request(app).get('/api/sources').set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
