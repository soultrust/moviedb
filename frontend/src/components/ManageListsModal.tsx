import { useState, useEffect, useCallback, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { fetchAllLists, deleteList, updateListTitle, createList } from '../api/lists';
import type { ListWithType } from '../api/lists';

interface ManageListsModalProps {
  onClose: () => void;
  /** Called after the list is successfully deleted on the server (e.g. navigate away if it was the active list). */
  onListDeleted?: (listId: number) => void;
  /** Called after a list is renamed so parent can refresh cached list data. */
  onListsChanged?: () => void;
}

function ManageListsModal({ onClose, onListDeleted, onListsChanged }: ManageListsModalProps) {
  const [lists, setLists] = useState<ListWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<Record<number, 'solid' | 'fade'>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [createListType, setCreateListType] = useState<'media' | 'person'>('media');
  const [createLoading, setCreateLoading] = useState(false);
  const deleteFeedbackTimersRef = useRef<Map<number, { fadeAt: number; clearAt: number }>>(
    new Map(),
  );
  const titleInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (editingId == null) return;
    const el = titleInputRef.current;
    if (el) {
      el.focus();
      el.select();
    }
  }, [editingId]);

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

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft('');
  }, []);

  const handleDelete = async (list: ListWithType) => {
    if (deletingId !== null || deleteFeedback[list.id]) return;
    if (editingId === list.id) cancelEdit();
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

  const beginEdit = (list: ListWithType) => {
    if (deleteFeedback[list.id] || savingId === list.id) return;
    setEditingId(list.id);
    setEditDraft(list.title);
  };

  const commitTitleEdit = async (list: ListWithType) => {
    const next = editDraft.trim();
    if (!next) {
      setEditDraft(list.title);
      cancelEdit();
      return;
    }
    if (next === list.title) {
      cancelEdit();
      return;
    }
    setSavingId(list.id);
    try {
      const updated = await updateListTitle(list.id, next);
      setLists((prev) =>
        prev.map((l) => (l.id === list.id ? { ...l, title: updated.title } : l)),
      );
      onListsChanged?.();
      cancelEdit();
    } catch {
      // stay in edit mode
    } finally {
      setSavingId(null);
    }
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>, list: ListWithType) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void commitTitleEdit(list);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const handleCreateList = async (e: FormEvent) => {
    e.preventDefault();
    const title = newListTitle.trim();
    if (!title || createLoading) return;
    setCreateLoading(true);
    try {
      const created = await createList(title, createListType);
      const mediaType = created.media_type === 'person' ? ('person' as const) : ('media' as const);
      setLists((prev) => [
        ...prev,
        {
          id: created.id,
          title: created.title,
          media_type: mediaType,
          contains_movie: false,
        },
      ]);
      onListsChanged?.();
      setNewListTitle('');
      setShowCreateForm(false);
    } catch {
      // createList throws with message
    } finally {
      setCreateLoading(false);
    }
  };

  const renderRow = (list: ListWithType) => {
    const fb = deleteFeedback[list.id];
    const isEditing = editingId === list.id;
    const busy = savingId === list.id || Boolean(deleteFeedback[list.id]);

    return (
      <li key={list.id} className="manage-lists-item">
        <div className="manage-lists-row">
          <div className="manage-lists-row-text">
            {isEditing ? (
              <input
                ref={titleInputRef}
                type="text"
                className="manage-lists-title-input"
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                onBlur={() => void commitTitleEdit(list)}
                onKeyDown={(e) => handleTitleKeyDown(e, list)}
                disabled={savingId === list.id}
                aria-label="List title"
              />
            ) : (
              <button
                type="button"
                className="manage-lists-title-btn"
                onClick={() => beginEdit(list)}
                disabled={busy}
              >
                {list.title}
              </button>
            )}
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
            disabled={deletingId === list.id || Boolean(deleteFeedback[list.id]) || isEditing}
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
        ) : (
          <>
            <div className="manage-lists-body">
              {lists.length === 0 ? (
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

            <div className="add-to-list-footer manage-lists-create-footer">
              <button
                type="button"
                className="add-to-list-create-link"
                onClick={() => setShowCreateForm((v) => !v)}
              >
                Create a new list
              </button>

              {showCreateForm && (
                <form
                  className="add-to-list-create-form manage-lists-create-form"
                  onSubmit={handleCreateList}
                >
                  <div className="manage-lists-create-type" role="group" aria-label="List type">
                    <label className="manage-lists-create-type-option">
                      <input
                        type="radio"
                        name="manage-new-list-type"
                        checked={createListType === 'media'}
                        onChange={() => setCreateListType('media')}
                        disabled={createLoading}
                      />
                      Movies &amp; TV
                    </label>
                    <label className="manage-lists-create-type-option">
                      <input
                        type="radio"
                        name="manage-new-list-type"
                        checked={createListType === 'person'}
                        onChange={() => setCreateListType('person')}
                        disabled={createLoading}
                      />
                      People
                    </label>
                  </div>
                  <div className="manage-lists-create-row">
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
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ManageListsModal;
