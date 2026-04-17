import React from 'react';
import { SortField, SortDirection } from '../types/pokemonChampions';
import { pokemonChampionsApi } from '../services/pokemonChampionsApi';

interface CompactFiltersProps {
  sortField: SortField;
  sortDirection: SortDirection;
  typeFilter: string;
  formFilter: string;
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionToggle: () => void;
  onTypeFilterChange: (type: string) => void;
  onFormFilterChange: (form: string) => void;
}

const CompactFilters: React.FC<CompactFiltersProps> = ({
  sortField,
  sortDirection,
  typeFilter,
  formFilter,
  onSortFieldChange,
  onSortDirectionToggle,
  onTypeFilterChange,
  onFormFilterChange,
}) => {
  const allTypes = pokemonChampionsApi.getUniqueTypes();
  const allForms = pokemonChampionsApi.getUniqueForms();

  return (
    <div className="bg-white rounded-lg shadow-md p-3 mb-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-700">Sort:</label>
          <select
            value={sortField}
            onChange={(e) => onSortFieldChange(e.target.value as SortField)}
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="name">Name</option>
            <option value="dexNumber">Dex #</option>
            <option value="hp">HP</option>
            <option value="atk">ATK</option>
            <option value="def">DEF</option>
            <option value="spa">SP.ATK</option>
            <option value="spd">SP.DEF</option>
            <option value="spe">SPD</option>
            <option value="total">Total</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-700">Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All</option>
            {allTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-700">Form:</label>
          <select
            value={formFilter}
            onChange={(e) => onFormFilterChange(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All</option>
            {allForms.map(form => (
              <option key={form} value={form}>
                {form}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onSortDirectionToggle}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    </div>
  );
};

export default CompactFilters;
