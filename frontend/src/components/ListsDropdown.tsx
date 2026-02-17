import { useState, useEffect, useRef } from 'react';
import { fetchAllLists } from '../api/lists';
import type { ListWithType } from '../api/lists';

interface ListsDropdownProps {
  isAuthenticated: boolean;
  onSelectList: (listId: number) => void;
  isListActive?: boolean;
}

function ListsDropdown({ isAuthenticated, onSelectList, isListActive }: ListsDropdownProps) {
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<ListWithType[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated || !open) return;
    setLoading(true);
    fetchAllLists()
      .then(setLists)
      .catch(() => setLists([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated, open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="lists-dropdown" ref={containerRef}>
      <button
        type="button"
        className={`header-link lists-dropdown-trigger${isListActive ? ' active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        My Lists
        <span className="lists-dropdown-chevron" aria-hidden>
          {open ? '▴' : '▾'}
        </span>
      </button>
      {open && (
        <div className="lists-dropdown-content">
          {loading ? (
            <div className="lists-dropdown-loading">
              <div className="spinner" />
              <span>Loading lists…</span>
            </div>
          ) : lists.length === 0 ? (
            <div className="lists-dropdown-empty">No lists yet</div>
          ) : (
            <ul className="lists-dropdown-list">
              {lists.some((l) => l.media_type === 'media') && (
                <li className="lists-dropdown-section-header">Movies & TV</li>
              )}
              {lists
                .filter((l) => l.media_type === 'media')
                .map((list) => (
                  <li key={list.id}>
                    <button
                      type="button"
                      className="lists-dropdown-item"
                      onClick={() => {
                        onSelectList(list.id);
                        setOpen(false);
                      }}
                    >
                      {list.title}
                    </button>
                  </li>
                ))}
              {lists.some((l) => l.media_type === 'person') && (
                <li className="lists-dropdown-section-header">People</li>
              )}
              {lists
                .filter((l) => l.media_type === 'person')
                .map((list) => (
                  <li key={list.id}>
                    <button
                      type="button"
                      className="lists-dropdown-item"
                      onClick={() => {
                        onSelectList(list.id);
                        setOpen(false);
                      }}
                    >
                      {list.title}
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default ListsDropdown;
