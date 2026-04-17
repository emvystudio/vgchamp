import { Pokemon, PokemonListResponse, PokemonSpecies } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

class PokemonApiService {
  private cache = new Map<string, any>();

  async fetchWithCache<T>(url: string): Promise<T> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${url}: ${response.statusText}`);
    }

    const data = await response.json();
    this.cache.set(url, data);
    return data;
  }

  async getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
    const url = `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
    return this.fetchWithCache<PokemonListResponse>(url);
  }

  async getPokemon(nameOrId: string | number): Promise<Pokemon> {
    const url = `${BASE_URL}/pokemon/${nameOrId}`;
    return this.fetchWithCache<Pokemon>(url);
  }

  async getPokemonSpecies(nameOrId: string | number): Promise<PokemonSpecies> {
    const url = `${BASE_URL}/pokemon-species/${nameOrId}`;
    return this.fetchWithCache<PokemonSpecies>(url);
  }

  async getAllPokemon(limit: number = 1000): Promise<Pokemon[]> {
    const listResponse = await this.getPokemonList(limit);
    const pokemonPromises = listResponse.results.map(pokemon => 
      this.getPokemon(pokemon.name)
    );
    
    return Promise.all(pokemonPromises);
  }

  async getPokemonWithSpecies(nameOrId: string | number): Promise<{ pokemon: Pokemon; species: PokemonSpecies }> {
    const [pokemon, species] = await Promise.all([
      this.getPokemon(nameOrId),
      this.getPokemonSpecies(nameOrId)
    ]);

    return { pokemon, species };
  }

  async searchPokemon(query: string): Promise<Pokemon[]> {
    try {
      const pokemon = await this.getPokemon(query.toLowerCase());
      return [pokemon];
    } catch (error) {
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const pokemonApi = new PokemonApiService();
