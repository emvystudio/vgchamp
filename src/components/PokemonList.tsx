import React, { useState, useMemo } from 'react';
import { PokemonWithSpecies } from '../hooks/usePokemon';
import PokemonCard from './PokemonCard';

interface PokemonListProps {
  pokemon: PokemonWithSpecies[];
  loading: boolean;
  error: string | null;
  onPokemonSelect: (pokemon: PokemonWithSpecies) => void;
}

type SortField = 'id' | 'name' | 'height' | 'weight' | 'base_experience' | 'total_stats';
type SortDirection = 'asc' | 'desc';

const PokemonList: React.FC<PokemonListProps> = ({ 
  pokemon, 
  loading, 
  error, 
  onPokemonSelect 
}) => {
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [pokedexFilter, setPokedexFilter] = useState<string>('all');

  const allTypes = useMemo(() => {
    const types = new Set<string>();
    pokemon.forEach(({ pokemon: p }) => {
      p.types.forEach(type => types.add(type.type.name));
    });
    return Array.from(types).sort();
  }, [pokemon]);

  const allPokedexes = useMemo(() => {
    const pokedexes = new Set<string>();
    pokemon.forEach(({ species }) => {
      species.pokedex_numbers.forEach(pn => pokedexes.add(pn.pokedex.name));
    });
    return Array.from(pokedexes).sort();
  }, [pokemon]);

  const filteredAndSortedPokemon = useMemo(() => {
    let filtered = pokemon;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(({ pokemon: p }) =>
        p.types.some(type => type.type.name === typeFilter)
      );
    }

    if (pokedexFilter !== 'all') {
      filtered = filtered.filter(({ species }) =>
        species.pokedex_numbers.some(pn => pn.pokedex.name === pokedexFilter)
      );
    }

    return filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'id':
          aValue = a.pokemon.id;
          bValue = b.pokemon.id;
          break;
        case 'name':
          aValue = a.pokemon.name;
          bValue = b.pokemon.name;
          break;
        case 'height':
          aValue = a.pokemon.height;
          bValue = b.pokemon.height;
          break;
        case 'weight':
          aValue = a.pokemon.weight;
          bValue = b.pokemon.weight;
          break;
        case 'base_experience':
          aValue = a.pokemon.base_experience || 0;
          bValue = b.pokemon.base_experience || 0;
          break;
        case 'total_stats':
          aValue = a.pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
          bValue = b.pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
          break;
        default:
          aValue = a.pokemon.id;
          bValue = b.pokemon.id;
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
  }, [pokemon, sortField, sortDirection, typeFilter, pokedexFilter]);

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
        <div className="text-lg text-gray-600">Loading Pokémon...</div>
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
              <option value="id">ID</option>
              <option value="name">Name</option>
              <option value="height">Height</option>
              <option value="weight">Weight</option>
              <option value="base_experience">Base Experience</option>
              <option value="total_stats">Total Stats</option>
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
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pokédex Filter
            </label>
            <select
              value={pokedexFilter}
              onChange={(e) => setPokedexFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Pokédexes</option>
              {allPokedexes.map(pokedex => (
                <option key={pokedex} value={pokedex}>
                  {pokedex.charAt(0).toUpperCase() + pokedex.slice(1).replace('-', ' ')}
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
            {filteredAndSortedPokemon.length} of {pokemon.length} Pokémon
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-start">
        {filteredAndSortedPokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.pokemon.id}
            pokemon={pokemon}
            onClick={onPokemonSelect}
          />
        ))}
      </div>

      {filteredAndSortedPokemon.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No Pokémon match the current filters.
        </div>
      )}
    </div>
  );
};

export default PokemonList;
