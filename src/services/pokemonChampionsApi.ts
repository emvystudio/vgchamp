import { PokemonChampion, PokemonStats, PokemonWithStats, CombatStat } from '../types/pokemonChampions';
import rosterData from '../data/roster.json';
import statsData from '../data/base-stats.json';

class PokemonChampionsApiService {
  private champions: PokemonChampion[] = rosterData as unknown as PokemonChampion[];
  private stats: PokemonStats[] = statsData as unknown as PokemonStats[];

  private cache = new Map<string, PokemonWithStats>();

  constructor() {
    this.preloadData();
  }

  private preloadData() {
    const statsMap = new Map<string, PokemonStats>();
    this.stats.forEach(stat => {
      const key = `${stat.name}-${stat.form}`;
      statsMap.set(key, stat);
    });

    this.champions.forEach(champion => {
      const key = `${champion.name}-${champion.form}`;
      const stats = statsMap.get(key);
      if (stats) {
        this.cache.set(key, { champion, stats });
      }
    });
  }

  async getAllPokemon(): Promise<PokemonWithStats[]> {
    return Array.from(this.cache.values());
  }

  async getPokemonByNameOrId(nameOrId: string | number): Promise<PokemonWithStats | null> {
    const searchStr = typeof nameOrId === 'string' ? nameOrId.toLowerCase() : nameOrId.toString();
    
    for (const [, pokemon] of Array.from(this.cache.entries())) {
      const nameMatch = pokemon.champion.name.toLowerCase() === searchStr;
      const idMatch = pokemon.champion.dexNumber.toString() === searchStr;
      
      if (nameMatch || idMatch) {
        return pokemon;
      }
    }
    
    return null;
  }

  async searchPokemon(query: string): Promise<PokemonWithStats[]> {
    const searchQuery = query.toLowerCase().trim();
    if (!searchQuery) return [];

    const results: PokemonWithStats[] = [];
    
    for (const [, pokemon] of Array.from(this.cache.entries())) {
      const nameMatch = pokemon.champion.name.toLowerCase().includes(searchQuery);
      const typeMatch = pokemon.champion.types.some((type: string) => 
        type.toLowerCase().includes(searchQuery)
      );
      const abilityMatch = Object.values(pokemon.champion.abilities).some((ability: string) =>
        ability.toLowerCase().includes(searchQuery)
      );
      
      if (nameMatch || typeMatch || abilityMatch) {
        results.push(pokemon);
      }
    }
    
    return results;
  }

  getCombatStats(pokemon: PokemonWithStats): CombatStat[] {
    const { stats } = pokemon;
    return [
      { name: 'ATK', value: stats.atk },
      { name: 'DEF', value: stats.def },
      { name: 'SP.ATK', value: stats.spa },
      { name: 'SP.DEF', value: stats.spd },
      { name: 'SPD', value: stats.spe }
    ];
  }

  getAbilities(pokemon: PokemonWithStats): { name: string; isHidden: boolean }[] {
    const abilities: { name: string; isHidden: boolean }[] = [];
    
    Object.entries(pokemon.champion.abilities).forEach(([slot, ability]) => {
      abilities.push({
        name: ability.replace(/-/g, ' '),
        isHidden: slot.toLowerCase() === 'h'
      });
    });
    
    return abilities;
  }

  getTypes(pokemon: PokemonWithStats): string[] {
    return pokemon.champion.types;
  }

  clearCache(): void {
    this.cache.clear();
    this.preloadData();
  }

  getUniqueTypes(): string[] {
    const types = new Set<string>();
    this.champions.forEach(champion => {
      champion.types.forEach(type => types.add(type));
    });
    return Array.from(types).sort();
  }

  getUniqueForms(): string[] {
    const forms = new Set<string>();
    this.champions.forEach(champion => {
      forms.add(champion.form);
    });
    return Array.from(forms).sort();
  }
}

export const pokemonChampionsApi = new PokemonChampionsApiService();
