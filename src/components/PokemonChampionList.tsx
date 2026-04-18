import React, { useState, useMemo } from 'react';
import { PokemonWithStats, SortField, SortDirection } from '../types/pokemonChampions';
import { pokemonChampionsApi } from '../services/pokemonChampionsApi';
import PokemonChampionCard from './PokemonChampionCard';
import InstantSearchBar from './InstantSearchBar';

interface PokemonChampionListProps {
  pokemon: PokemonWithStats[];
  filteredPokemon: PokemonWithStats[];
  loading: boolean;
  error: string | null;
  onPokemonSelect: (pokemon: PokemonWithStats) => void;
  onAddToParty: (pokemon: PokemonWithStats) => void;
  showPartyActions: boolean;
  isSwapMode: boolean;
  onSwapSelect: (pokemon: PokemonWithStats) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterToggles: {
    name: boolean;
    type: boolean;
    ability: boolean;
  };
  onFilterToggleChange: (toggles: { name: boolean; type: boolean; ability: boolean }) => void;
  onDragStart?: (pokemon: PokemonWithStats, source: 'list' | 'party') => void;
  onDragEnd?: () => void;
  onDropOnList?: (pokemon: PokemonWithStats) => void;
}

const SORT_FIELDS: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'dexNumber', label: '#' },
  { field: 'total', label: 'BST' },
  { field: 'hp', label: 'HP' },
  { field: 'atk', label: 'Atk' },
  { field: 'def', label: 'Def' },
  { field: 'spa', label: 'SpA' },
  { field: 'spd', label: 'SpD' },
  { field: 'spe', label: 'Spe' },
];

const PokemonChampionList: React.FC<PokemonChampionListProps> = ({
  pokemon,
  filteredPokemon,
  loading,
  error,
  onPokemonSelect,
  onAddToParty,
  showPartyActions,
  isSwapMode,
  onSwapSelect,
  searchQuery,
  onSearchChange,
  filterToggles,
  onFilterToggleChange,
  onDragStart,
  onDragEnd,
  onDropOnList,
}) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [typeFilter, setTypeFilter] = useState('all');
  const [formFilter, setFormFilter] = useState('all');

  const allTypes = useMemo(() => pokemonChampionsApi.getUniqueTypes(), []);
  const allForms = useMemo(() => pokemonChampionsApi.getUniqueForms(), []);

  const sorted = useMemo(() => {
    let list = [...filteredPokemon];

    if (typeFilter !== 'all') {
      list = list.filter(({ champion }) => champion.types.includes(typeFilter));
    }
    if (formFilter !== 'all') {
      list = list.filter(({ champion }) => champion.form === formFilter);
    }

    list.sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      switch (sortField) {
        case 'name':       av = a.champion.name;  bv = b.champion.name; break;
        case 'dexNumber':  av = a.champion.dexNumber; bv = b.champion.dexNumber; break;
        case 'hp':         av = a.stats.hp;   bv = b.stats.hp;   break;
        case 'atk':        av = a.stats.atk;  bv = b.stats.atk;  break;
        case 'def':        av = a.stats.def;  bv = b.stats.def;  break;
        case 'spa':        av = a.stats.spa;  bv = b.stats.spa;  break;
        case 'spd':        av = a.stats.spd;  bv = b.stats.spd;  break;
        case 'spe':        av = a.stats.spe;  bv = b.stats.spe;  break;
        case 'total':      av = a.stats.total; bv = b.stats.total; break;
        default:           av = a.champion.name; bv = b.champion.name;
      }
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDirection === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDirection === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

    return list;
  }, [filteredPokemon, sortField, sortDirection, typeFilter, formFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-500">
        Loading Pokémon Champions…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-48 text-red-500">
        Error: {error}
      </div>
    );
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnList = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const pokemon = JSON.parse(e.dataTransfer.getData('text/plain')) as PokemonWithStats;
      if (onDropOnList) {
        onDropOnList(pokemon);
      }
    } catch (err) {
      console.error('Failed to parse dropped data:', err);
    }
  };

  return (
    <div 
      className="space-y-3"
      onDragOver={handleDragOver}
      onDrop={handleDropOnList}
    >
      {/* Controls bar */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 px-3 py-2 flex flex-wrap items-center gap-2">
        {/* Sort buttons */}
        <div className="flex flex-wrap gap-1">
          {SORT_FIELDS.map(({ field, label }) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                sortField === field
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              {label}
              {sortField === field && (
                <span className="ml-0.5 opacity-70">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-gray-700 self-center" />

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1 outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">All types</option>
          {allTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Form filter */}
        <select
          value={formFilter}
          onChange={e => setFormFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1 outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">All forms</option>
          {allForms.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 ml-auto">
          {/* Filter toggles */}
          <div className="flex gap-1">
            <button
              onClick={() => onFilterToggleChange({ ...filterToggles, name: !filterToggles.name })}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                filterToggles.name
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
              title="Toggle name filter"
            >
              Name
            </button>
            <button
              onClick={() => onFilterToggleChange({ ...filterToggles, type: !filterToggles.type })}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                filterToggles.type
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
              title="Toggle type filter"
            >
              Type
            </button>
            <button
              onClick={() => onFilterToggleChange({ ...filterToggles, ability: !filterToggles.ability })}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                filterToggles.ability
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
              title="Toggle ability filter"
            >
              Ability
            </button>
          </div>

          <div className="min-w-[160px] max-w-sm">
            <InstantSearchBar onSearch={onSearchChange} query={searchQuery} />
          </div>
        </div>

        <span className="text-xs text-gray-600">
          {sorted.length} / {pokemon.length}
        </span>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {sorted.map(p => (
          <PokemonChampionCard
            key={`${p.champion.name}-${p.champion.form}`}
            pokemon={p}
            onClick={onPokemonSelect}
            showPartyActions={showPartyActions}
            onAddToParty={onAddToParty}
            isSwapMode={isSwapMode}
            onSwapSelect={onSwapSelect}
            draggable={true}
            onDragStart={() => onDragStart && onDragStart(p, 'list')}
            onDragEnd={() => onDragEnd && onDragEnd()}
          />
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          No Pokémon match the current filters.
        </div>
      )}
    </div>
  );
};

export default PokemonChampionList;
