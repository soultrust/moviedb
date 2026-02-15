import { authFetch } from './auth';

const API = 'http://localhost:8000/api/auth/consumed';

/**
 * List consumed items for the current user (requires login).
 */
export async function listConsumed() {
  const res = await authFetch(API + '/');
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Failed to load consumed list');
  return res.json();
}

/**
 * Add a movie/show to consumed (requires login).
 */
export async function addConsumed({ tmdb_id, title, media_type }) {
  const res = await authFetch(API + '/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tmdb_id: Number(tmdb_id),
      title: title || '',
      media_type: media_type || 'movie',
    }),
  });
  if (res.status === 401) return null;
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || data.tmdb_id?.[0] || 'Failed to add');
  }
  return res.json();
}

/**
 * Remove a consumed item by its backend id (requires login).
 */
export async function removeConsumed(id) {
  const res = await authFetch(`${API}/${id}/`, { method: 'DELETE' });
  if (res.status === 401) return false;
  if (!res.ok) throw new Error('Failed to remove');
  return true;
}

/**
 * Check if the current user has tmdb_id in their consumed list. Returns boolean or null if not logged in.
 */
export async function isConsumedByUser(tmdb_id) {
  const items = await listConsumed();
  if (items === null) return null;
  return items.some((item) => item.tmdb_id === Number(tmdb_id));
}

/**
 * Toggle consumed: add if not in list, remove if in list. Returns { added: boolean } or null if not logged in.
 */
export async function toggleConsumedByUser(payload) {
  const items = await listConsumed();
  if (items === null) return null;
  const existing = items.find((i) => i.tmdb_id === Number(payload.id));
  if (existing) {
    await removeConsumed(existing.id);
    return { added: false };
  }
  await addConsumed({
    tmdb_id: payload.id,
    title: payload.title || payload.name,
    media_type: payload.media_type || 'movie',
  });
  return { added: true };
}
