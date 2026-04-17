import React, { useState, useMemo } from 'react';
import { PokemonWithStats, SortField, SortDirection } from '../types/pokemonChampions';
import { pokemonChampionsApi } from '../services/pokemonChampionsApi';
import PokemonChampionCard from './PokemonChampionCard';

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
}

const PokemonChampionList: React.FC<PokemonChampionListProps> = ({ 
  pokemon, 
  filteredPokemon,
  loading, 
  error, 
  onPokemonSelect,
  onAddToParty,
  showPartyActions,
  isSwapMode,
  onSwapSelect
}) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [formFilter, setFormFilter] = useState<string>('all');

  const allTypes = useMemo(() => {
    return pokemonChampionsApi.getUniqueTypes();
  }, []);

  const allForms = useMemo(() => {
    return pokemonChampionsApi.getUniqueForms();
  }, []);

  const filteredAndSortedPokemon = useMemo(() => {
    let filtered = filteredPokemon;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(({ champion }) =>
        champion.types.includes(typeFilter)
      );
    }

    if (formFilter !== 'all') {
      filtered = filtered.filter(({ champion }) =>
        champion.form === formFilter
      );
    }

    return filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'name':
          aValue = a.champion.name;
          bValue = b.champion.name;
          break;
        case 'dexNumber':
          aValue = a.champion.dexNumber;
          bValue = b.champion.dexNumber;
          break;
        case 'hp':
          aValue = a.stats.hp;
          bValue = b.stats.hp;
          break;
        case 'atk':
          aValue = a.stats.atk;
          bValue = b.stats.atk;
          break;
        case 'def':
          aValue = a.stats.def;
          bValue = b.stats.def;
          break;
        case 'spa':
          aValue = a.stats.spa;
          bValue = b.stats.spa;
          break;
        case 'spd':
          aValue = a.stats.spd;
          bValue = b.stats.spd;
          break;
        case 'spe':
          aValue = a.stats.spe;
          bValue = b.stats.spe;
          break;
        case 'total':
          aValue = a.stats.total;
          bValue = b.stats.total;
          break;
        default:
          aValue = a.champion.name;
          bValue = b.champion.name;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [filteredPokemon, sortField, sortDirection, typeFilter, formFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading Pokémon Champions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">Filters & Sorting</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value as SortField)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="dexNumber">Dex Number</option>
              <option value="hp">HP</option>
              <option value="atk">Attack</option>
              <option value="def">Defense</option>
              <option value="spa">Special Attack</option>
              <option value="spd">Special Defense</option>
              <option value="spe">Speed</option>
              <option value="total">Total Stats</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type Filter
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {allTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form Filter
            </label>
            <select
              value={formFilter}
              onChange={(e) => setFormFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Forms</option>
              {allForms.map(form => (
                <option key={form} value={form}>
                  {form}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          </button>
          <span className="text-sm text-gray-600">
            {filteredAndSortedPokemon.length} of {pokemon.length} Pokémon Champions
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-start">
        {filteredAndSortedPokemon.map((pokemon) => (
          <PokemonChampionCard
            key={`${pokemon.champion.name}-${pokemon.champion.form}`}
            pokemon={pokemon}
            onClick={onPokemonSelect}
          />
        ))}
      </div>

      {filteredAndSortedPokemon.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No Pokémon Champions match the current filters.
        </div>
      )}
    </div>
  );
};

export default PokemonChampionList;
