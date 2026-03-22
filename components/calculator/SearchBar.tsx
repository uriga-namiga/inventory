'use client';

import { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearchChange: (search: string) => void;
  search: string;
}

export default function SearchBar({
  onSearchChange,
  search,
}: SearchBarProps) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="파츠 검색..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}
