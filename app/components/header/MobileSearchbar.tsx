'use client';

import React, { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MobileSearchbar = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        aria-label="Ara"
      >
        <Search className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center pt-20 px-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                Arama
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="p-4">
              <div className="flex items-center border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800">
                <Search className="h-4 w-4 text-neutral-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ara..."
                  className="w-full ml-2 py-3 px-1 text-sm bg-transparent border-none focus:outline-none text-neutral-700 dark:text-neutral-200 placeholder-neutral-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md"
                  >
                    <X className="h-4 w-4 text-neutral-400" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-3 h-full px-4 py-3 bg-[#a90013] hover:bg-[#8a0010] dark:bg-[#a90013] dark:hover:bg-[#8a0010] text-white transition-colors duration-200 text-sm font-medium"
              >
                Ara
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSearchbar;