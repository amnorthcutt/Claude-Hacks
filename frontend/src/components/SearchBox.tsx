import React, { useState, useEffect } from 'react';

interface SearchBoxProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchBox({ searchQuery, onSearchChange }: SearchBoxProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, onSearchChange]);

  return (
    <div className="search-box">
      <input
        type="text"
        placeholder="🔍 Search events..."
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        className="search-input"
      />
    </div>
  );
}
