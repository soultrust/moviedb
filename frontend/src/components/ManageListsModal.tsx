import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAllLists, deleteList } from '../api/lists';
import type { ListWithType } from '../api/lists';

interface ManageListsModalProps {
  onClose: () => void;
  /** Called after the list is successfully deleted on the server (e.g. navigate away if it was the active list). */
  onListDeleted?: (listId: number) => void;
}

function ManageListsModal({ onClose, onListDeleted }: ManageListsModalProps) {
  const [lists, setLists] = useState<ListWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<Record<number, 'solid' | 'fade'>>({});
  const deleteFeedbackTimersRef = useRef<Map<number, { fadeAt: number; clearAt: number }>>(
    new Map(),
  );

  const loadLists = useCallback(() => {
    setLoading(true);
    fetchAllLists()
      .then(setLists)
      .catch(() => setLists([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  useEffect(() => {
    return () => {
      deleteFeedbackTimersRef.current.forEach(({ fadeAt, clearAt }) => {
        clearTimeout(fadeAt);
        clearTimeout(clearAt);
      });
      deleteFeedbackTimersRef.current.clear();
    };
  }, []);

  const showDeletedFeedback = useCallback((listId: number) => {
    const prevTimers = deleteFeedbackTimersRef.current.get(listId);
    if (prevTimers) {
      clearTimeout(prevTimers.fadeAt);
      clearTimeout(prevTimers.clearAt);
    }
    setDeleteFeedback((s) => ({ ...s, [listId]: 'solid' }));
    const fadeAt = window.setTimeout(() => {
      setDeleteFeedback((s) =>
        s[listId] === 'solid' ? { ...s, [listId]: 'fade' } : s,
      );
    }, 2500);
    const clearAt = window.setTimeout(() => {
      setLists((prev) => prev.filter((l) => l.id !== listId));
      setDeleteFeedback((s) => {
        const next = { ...s };
        delete next[listId];
        return next;
      });
      deleteFeedbackTimersRef.current.delete(listId);
    }, 3000);
    deleteFeedbackTimersRef.current.set(listId, { fadeAt, clearAt });
  }, []);

  const handleDelete = async (list: ListWithType) => {
    if (deletingId !== null || deleteFeedback[list.id]) return;
    setDeletingId(list.id);
    try {
      await deleteList(list.id);
      onListDeleted?.(list.id);
      showDeletedFeedback(list.id);
    } catch {
      // keep row; user can retry
    } finally {
      setDeletingId(null);
    }
  };

  const renderRow = (list: ListWithType) => {
    const fb = deleteFeedback[list.id];
    return (
      <li key={list.id} className="manage-lists-item">
        <div className="manage-lists-row">
          <div className="manage-lists-row-text">
            <span className="manage-lists-row-title">{list.title}</span>
            {fb && (
              <span
                className={
                  fb === 'fade'
                    ? 'add-to-list-feedback-badge add-to-list-feedback-badge--exiting'
                    : 'add-to-list-feedback-badge'
                }
                aria-live="polite"
              >
                DELETED
              </span>
            )}
          </div>
          <button
            type="button"
            className="manage-lists-delete-btn"
            onClick={() => handleDelete(list)}
            disabled={deletingId === list.id || Boolean(deleteFeedback[list.id])}
            aria-label={`Delete list ${list.title}`}
          >
            ×
          </button>
        </div>
      </li>
    );
  };

  const mediaLists = lists.filter((l) => l.media_type === 'media');
  const personLists = lists.filter((l) => l.media_type === 'person');

  return (
    <div
      className="add-to-list-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal
      aria-labelledby="manage-lists-title"
    >
      <div className="add-to-list-modal manage-lists-modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="manage-lists-title" className="add-to-list-modal-title">
          Manage Lists
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
        ) : lists.length === 0 ? (
          <p className="manage-lists-empty">No lists yet</p>
        ) : (
          <ul className="manage-lists-list">
            {mediaLists.length > 0 && (
              <li className="lists-dropdown-section-header">Movies & TV</li>
            )}
            {mediaLists.map((list) => renderRow(list))}
            {personLists.length > 0 && (
              <li className="lists-dropdown-section-header">People</li>
            )}
            {personLists.map((list) => renderRow(list))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ManageListsModal;
