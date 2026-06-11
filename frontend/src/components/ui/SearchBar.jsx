import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export default function SearchBar({ placeholder = 'Buscar produtos...', onSearch, className = '' }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="h-5 w-5 text-text-muted" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-dark-800 border border-dark-600 rounded-full py-2 pl-10 pr-10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary placeholder-text-muted transition-all"
        placeholder={placeholder}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary"
        >
          <FiX className="h-5 w-5" />
        </button>
      )}
    </form>
  );
}
