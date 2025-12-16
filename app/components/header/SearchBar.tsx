import React, { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="w-64 md:w-72 bg-white dark:bg-neutral-800 rounded-md shadow-md border border-neutral-100 dark:border-neutral-700 overflow-hidden">
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative flex-grow flex items-center pl-3">
            <Search className="h-4 w-4 text-neutral-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ara..."
              className="w-full ml-2 py-2.5 px-1 text-sm bg-transparent border-none focus:outline-none text-neutral-700 dark:text-neutral-200 placeholder-neutral-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300 p-2"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="ml-2 h-full px-3 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 transition-colors duration-200"
          >
            Ara
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;