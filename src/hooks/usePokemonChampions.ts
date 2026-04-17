import { useState, useEffect, useCallback } from 'react';
import { PokemonWithStats } from '../types/pokemonChampions';
import { pokemonChampionsApi } from '../services/pokemonChampionsApi';

export interface UsePokemonChampionsReturn {
  pokemon: PokemonWithStats[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePokemonChampions = (): UsePokemonChampionsReturn => {
  const [pokemon, setPokemon] = useState<PokemonWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const pokemonList = await pokemonChampionsApi.getAllPokemon();
      setPokemon(pokemonList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { pokemon, loading, error, refetch: fetchData };
};
