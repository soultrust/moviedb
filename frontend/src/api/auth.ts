import type { AuthPayload, User } from '../types';
import { API_URLS } from '../config';

const AUTH_API = API_URLS.AUTH;
const ACCESS_KEY = 'moviedb_access';
const REFRESH_KEY = 'moviedb_refresh';
const USER_KEY = 'moviedb_user';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function getUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setAuth(payload: Partial<AuthPayload>): void {
  if (payload.access) localStorage.setItem(ACCESS_KEY, payload.access);
  if (payload.refresh) localStorage.setItem(REFRESH_KEY, payload.refresh);
  if (payload.user) localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
}

export function clearAuth(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const access = getAccessToken();
  const headers = { ...options.headers } as Record<string, string>;
  if (access) headers.Authorization = `Bearer ${access}`;
  return fetch(url, { ...options, headers });
}

interface RegisterError {
  email?: string[];
  password?: string[];
  password_confirm?: string[];
  detail?: string;
}

export async function register(
  email: string,
  password: string,
  name = ''
): Promise<AuthPayload> {
  const res = await fetch(`${AUTH_API}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, password_confirm: password, name }),
  });
  const data = (await res.json().catch(() => ({}))) as AuthPayload & RegisterError;
  if (!res.ok) {
    const msg =
      data.email?.[0] ||
      data.password?.[0] ||
      data.password_confirm?.[0] ||
      data.detail ||
      'Registration failed';
    throw new Error(Array.isArray(msg) ? msg[0] : msg);
  }
  return data as AuthPayload;
}

export async function login(email: string, password: string): Promise<AuthPayload> {
  const res = await fetch(`${AUTH_API}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json().catch(() => ({}))) as AuthPayload & { detail?: string };
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data as AuthPayload;
}

export async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const res = await fetch(`${AUTH_API}/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  const data = (await res.json().catch(() => ({}))) as { access?: string };
  if (!res.ok) return null;
  if (data.access) localStorage.setItem(ACCESS_KEY, data.access);
  return data.access ?? null;
}

export async function me(): Promise<User | null> {
  const res = await authFetch(`${AUTH_API}/me/`);
  if (!res.ok) return null;
  return res.json() as Promise<User>;
}
