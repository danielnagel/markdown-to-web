import rateLimit from 'express-rate-limit';

// Brute-force protection for POST /auth/login: at most 10 failed attempts per
// IP within 15 minutes. Successful logins don't count, so a user who logs in
// normally never runs into the limit. Relies on `trust proxy` (see app.js)
// so req.ip is the real client and not the reverse proxy in front.
export function createLoginRateLimiter({ skipInTest = true } = {}) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'rate_limited' },
    // Vitest sets NODE_ENV=test; the regular route tests log in far more than
    // 10 times with wrong credentials, so the shared limiter is disabled there.
    // tests/rateLimit.test.js builds its own instance with skipInTest: false.
    skip: () => skipInTest && process.env.NODE_ENV === 'test',
  });
}

export const loginRateLimiter = createLoginRateLimiter();
