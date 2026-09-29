import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createLoginRateLimiter } from '../src/middleware/rateLimit.js';

// The shared loginRateLimiter is skipped under NODE_ENV=test, so this mounts a
// fresh instance of the same configuration in front of a stand-in login
// handler (401 unless the body says otherwise) - that keeps the real bcrypt
// check and user DB out of a test that fires a dozen requests.
function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.post('/login', createLoginRateLimiter({ skipInTest: false }), (req, res) => {
    res.status(req.body?.valid ? 200 : 401).json({});
  });
  return app;
}

describe('login rate limiter', () => {
  it('rejects the 11th failed attempt with 429', async () => {
    const app = buildTestApp();

    for (let i = 0; i < 10; i += 1) {
      const res = await request(app).post('/login').send({});
      expect(res.status).toBe(401);
    }

    const blocked = await request(app).post('/login').send({ valid: true });
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ error: 'rate_limited' });
  });

  it('does not count successful logins', async () => {
    const app = buildTestApp();

    for (let i = 0; i < 20; i += 1) {
      const res = await request(app).post('/login').send({ valid: true });
      expect(res.status).toBe(200);
    }

    const failed = await request(app).post('/login').send({});
    expect(failed.status).toBe(401);
  });
});
