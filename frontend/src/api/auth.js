const AUTH_API = 'http://localhost:8000/api/auth';
const ACCESS_KEY = 'moviedb_access';
const REFRESH_KEY = 'moviedb_refresh';
const USER_KEY = 'moviedb_user';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth({ access, refresh, user }) {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function authFetch(url, options = {}) {
  const access = getAccessToken();
  const headers = { ...options.headers };
  if (access) headers.Authorization = `Bearer ${access}`;
  return fetch(url, { ...options, headers });
}

export async function register(email, password, name = '') {
  const res = await fetch(`${AUTH_API}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, password_confirm: password, name }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.email?.[0] || data.password?.[0] || data.password_confirm?.[0] || data.detail || 'Registration failed';
    throw new Error(Array.isArray(msg) ? msg[0] : msg);
  }
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${AUTH_API}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data;
}

export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const res = await fetch(`${AUTH_API}/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return null;
  if (data.access) localStorage.setItem(ACCESS_KEY, data.access);
  return data.access;
}

export async function me() {
  const res = await authFetch(`${AUTH_API}/me/`);
  if (!res.ok) return null;
  return res.json();
}
