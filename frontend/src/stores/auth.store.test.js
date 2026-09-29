import { it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from './auth.store';
import { TOKEN_STORAGE_KEY } from '../constants/auth';

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
});

it('stores the token on successful login', async () => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ token: 'abc123' }),
  });

  const store = useAuthStore();
  await store.login('admin', 'secret');

  expect(store.token).toBe('abc123');
  expect(store.isAuthenticated).toBe(true);
  expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('abc123');
});

it('throws and does not store a token on failed login', async () => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ error: 'invalid_credentials' }),
  });

  const store = useAuthStore();
  await expect(store.login('admin', 'wrong')).rejects.toThrow();
  expect(store.isAuthenticated).toBe(false);
});

it('clears the token on logout', () => {
  const store = useAuthStore();
  store.token = 'abc123';
  localStorage.setItem(TOKEN_STORAGE_KEY, 'abc123');

  store.logout();

  expect(store.token).toBeNull();
  expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
});
