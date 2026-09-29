import router from '../router';
import { TOKEN_STORAGE_KEY } from '../constants/auth';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// fetch wrapper that attaches the JWT (from localStorage - see
// stores/auth.store.js) as a Bearer token and centralizes 401 handling: an
// expired/missing session clears the stored token and redirects to /login.
async function request(path, { method = 'GET', body, params } = {}) {
  let url = `${API_BASE}${path}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value);
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  const response = await fetch(url, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    if (router.currentRoute.value.name !== 'login') {
      router.push({ name: 'login' });
    }
    throw new ApiError('not_authenticated', 401, null);
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(data?.error || 'unknown_error', response.status, data);
  }

  return data;
}

export const apiClient = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
};

export { ApiError };
