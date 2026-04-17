import React, { useState, useEffect, useCallback } from 'react';
import { SearchIcon } from '@heroicons/react/outline';

interface InstantSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const InstantSearchBar: React.FC<InstantSearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search Pokemon by name, type, or ability..." 
}) => {
  const [query, setQuery] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
  }, [onSearch]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-1.5 border border-gray-700 rounded-lg leading-5 bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
      />
    </div>
  );
};

export default InstantSearchBar;
