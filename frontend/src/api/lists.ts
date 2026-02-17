import { authFetch } from './auth';
import type { MovieList } from '../types';
import { API_URLS } from '../config';

const LISTS_API = API_URLS.LISTS;

/**
 * Fetch user's lists filtered by list type (media or person).
 * Optionally pass tmdb_id and item media_type to get contains_movie flag.
 */
export async function fetchLists(params: {
  listMediaType: 'media' | 'person';
  tmdbId?: number;
  itemMediaType?: 'movie' | 'tv' | 'person';
}): Promise<MovieList[]> {
  const q = new URLSearchParams({ media_type: params.listMediaType });
  if (params.tmdbId != null) {
    q.set('tmdb_id', String(params.tmdbId));
    if (params.itemMediaType) q.set('item_media_type', params.itemMediaType);
  }
  const res = await authFetch(LISTS_API + '/?' + q.toString());
  if (res.status === 401) return [];
  if (!res.ok) throw new Error('Failed to load lists');
  return res.json() as Promise<MovieList[]>;
}

/**
 * Create a new list.
 */
export async function createList(
  title: string,
  listMediaType: 'media' | 'person'
): Promise<{ id: number; title: string; media_type: string }> {
  const res = await authFetch(LISTS_API + '/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title.trim(), media_type: listMediaType }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(data.detail ?? 'Failed to create list');
  }
  return res.json() as Promise<{ id: number; title: string; media_type: string }>;
}

/**
 * Add or remove a movie/show from a list.
 */
export async function toggleListMembership(
  listId: number,
  payload: {
    tmdb_id: number;
    media_type?: string;
    title?: string;
    poster_path?: string | null;
  },
  add: boolean
): Promise<{ in_list: boolean }> {
  const url = `${LISTS_API}/${listId}/toggle/`;
  const body = {
    tmdb_id: payload.tmdb_id,
    media_type: payload.media_type ?? 'movie',
    title: payload.title ?? '',
    poster_path: payload.poster_path ?? null,
  };
  const res = add
    ? await authFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    : await authFetch(url + '?' + new URLSearchParams({ tmdb_id: String(body.tmdb_id), media_type: body.media_type }), {
        method: 'DELETE',
      });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(data.detail ?? 'Failed to update list');
  }
  return res.json() as Promise<{ in_list: boolean }>;
}
