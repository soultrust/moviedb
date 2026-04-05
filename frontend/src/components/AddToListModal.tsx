import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchLists, createList, toggleListMembership } from '../api/lists';
import type { MovieList } from '../types';

export type ListMediaType = 'media' | 'person';

export type AddToListItem =
  | { id: number; mediaType: 'movie' | 'tv'; title: string; posterPath?: string | null }
  | { id: number; mediaType: 'person'; name: string; profilePath?: string | null };

interface AddToListModalProps {
  item: AddToListItem;
  listMediaType: ListMediaType;
  onClose: () => void;
}

function AddToListModal({ item, listMediaType, onClose }: AddToListModalProps) {
  const [lists, setLists] = useState<MovieList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  /** Per-list ADDED!/REMOVED flash: solid 2.5s, fade 0.5s (3s total). */
  const [listFeedback, setListFeedback] = useState<
    Record<number, { kind: 'added' | 'removed'; phase: 'solid' | 'fade' }>
  >({});
  const listFeedbackTimersRef = useRef<Map<number, { fadeAt: number; clearAt: number }>>(
    new Map(),
  );

  const itemMediaType = item.mediaType;
  const itemId = item.id;
  const itemTitle = item.mediaType === 'person' ? item.name : item.title;
  const itemImagePath = item.mediaType === 'person' ? item.profilePath : item.posterPath;

  const loadLists = useCallback(() => {
    setLoading(true);
    fetchLists({
      listMediaType,
      tmdbId: itemId,
      itemMediaType: itemMediaType === 'person' ? 'person' : itemMediaType,
    })
      .then(setLists)
      .catch(() => setLists([]))
      .finally(() => setLoading(false));
  }, [listMediaType, itemId, itemMediaType]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  useEffect(() => {
    return () => {
      listFeedbackTimersRef.current.forEach(({ fadeAt, clearAt }) => {
        clearTimeout(fadeAt);
        clearTimeout(clearAt);
      });
      listFeedbackTimersRef.current.clear();
    };
  }, []);

  const showListFeedback = useCallback((listId: number, kind: 'added' | 'removed') => {
    const prevTimers = listFeedbackTimersRef.current.get(listId);
    if (prevTimers) {
      clearTimeout(prevTimers.fadeAt);
      clearTimeout(prevTimers.clearAt);
    }
    setListFeedback((s) => ({ ...s, [listId]: { kind, phase: 'solid' } }));
    const fadeAt = window.setTimeout(() => {
      setListFeedback((s) => {
        const cur = s[listId];
        return cur?.phase === 'solid'
          ? { ...s, [listId]: { ...cur, phase: 'fade' } }
          : s;
      });
    }, 2500);
    const clearAt = window.setTimeout(() => {
      setListFeedback((s) => {
        const next = { ...s };
        delete next[listId];
        return next;
      });
      listFeedbackTimersRef.current.delete(listId);
    }, 3000);
    listFeedbackTimersRef.current.set(listId, { fadeAt, clearAt });
  }, []);

  const handleCheckboxChange = async (list: MovieList, checked: boolean) => {
    if (togglingId !== null) return;
    setTogglingId(list.id);
    try {
      await toggleListMembership(
        list.id,
        {
          tmdb_id: itemId,
          media_type: itemMediaType === 'person' ? 'person' : itemMediaType,
          title: itemTitle,
          poster_path: itemImagePath ?? null,
        },
        checked
      );
      setLists((prev) =>
        prev.map((l) =>
          l.id === list.id ? { ...l, contains_movie: checked } : l
        )
      );
      showListFeedback(list.id, checked ? 'added' : 'removed');
    } catch {
      // Revert on error
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newListTitle.trim();
    if (!title || createLoading) return;
    setCreateLoading(true);
    try {
      const created = await createList(title, listMediaType);
      await toggleListMembership(
        created.id,
        {
          tmdb_id: itemId,
          media_type: itemMediaType === 'person' ? 'person' : itemMediaType,
          title: itemTitle,
          poster_path: itemImagePath ?? null,
        },
        true
      );
      setLists((prev) => [...prev, { ...created, contains_movie: true }]);
      showListFeedback(created.id, 'added');
      setNewListTitle('');
      setShowCreateForm(false);
    } catch {
      // Error handled by createList
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div
      className="add-to-list-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal
      aria-labelledby="add-to-list-title"
    >
      <div className="add-to-list-modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="add-to-list-title" className="add-to-list-modal-title">
          Add to Lists
        </h2>
        <button
          type="button"
          className="add-to-list-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {loading ? (
          <div className="add-to-list-loading">
            <div className="spinner" />
            <p>Loading lists…</p>
          </div>
        ) : (
          <>
            <ul className="add-to-list-list">
              {lists.map((list) => {
                const fb = listFeedback[list.id];
                return (
                  <li key={list.id} className="add-to-list-item">
                    <label className="add-to-list-checkbox-label">
                      <input
                        type="checkbox"
                        checked={list.contains_movie}
                        onChange={(e) =>
                          handleCheckboxChange(list, e.target.checked)
                        }
                        disabled={togglingId === list.id}
                        className="add-to-list-checkbox"
                      />
                      <span className="add-to-list-checkbox-box" />
                      <span className="add-to-list-checkbox-text">
                        {list.title}
                        {fb && (
                          <span
                            className={
                              fb.phase === 'fade'
                                ? 'add-to-list-feedback-badge add-to-list-feedback-badge--exiting'
                                : 'add-to-list-feedback-badge'
                            }
                            aria-live="polite"
                          >
                            {fb.kind === 'added' ? 'ADDED!' : 'REMOVED'}
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>

            <div className="add-to-list-footer">
              <button
                type="button"
                className="add-to-list-create-link"
                onClick={() => setShowCreateForm((v) => !v)}
              >
                Create a new list
              </button>

              {showCreateForm && (
                <form
                  className="add-to-list-create-form"
                  onSubmit={handleCreateList}
                >
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="List title"
                    className="add-to-list-create-input"
                    autoFocus
                    disabled={createLoading}
                  />
                  <button
                    type="submit"
                    className="add-to-list-create-btn"
                    disabled={!newListTitle.trim() || createLoading}
                  >
                    {createLoading ? 'Creating…' : 'Create'}
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AddToListModal;
