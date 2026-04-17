import { useState, useEffect, useCallback } from 'react';
import { Pokemon, PokemonSpecies } from '../types/pokemon';
import { pokemonApi } from '../services/pokemonApi';

export interface PokemonWithSpecies {
  pokemon: Pokemon;
  species: PokemonSpecies;
}

export interface UsePokemonReturn {
  pokemon: PokemonWithSpecies[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePokemon = (limit: number = 100): UsePokemonReturn => {
  const [pokemon, setPokemon] = useState<PokemonWithSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const pokemonList = await pokemonApi.getAllPokemon(limit);
      const pokemonWithSpecies: PokemonWithSpecies[] = [];
      
      for (const p of pokemonList) {
        try {
          const species = await pokemonApi.getPokemonSpecies(p.id);
          pokemonWithSpecies.push({ pokemon: p, species });
        } catch (speciesError) {
          console.warn(`Failed to fetch species for ${p.name}:`, speciesError);
          pokemonWithSpecies.push({ 
            pokemon: p, 
            species: {
              id: p.id,
              name: p.name,
              pokedex_numbers: [],
              genera: []
            }
          });
        }
      }
      
      setPokemon(pokemonWithSpecies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon data');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { pokemon, loading, error, refetch: fetchData };
};
