import { useState, FormEvent } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search for movies, TV shows, or people..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
      />
    </form>
  );
}

export default SearchBar;
