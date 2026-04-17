export interface PokemonChampion {
  name: string;
  dexNumber: number;
  form: string;
  types: string[];
  abilities: {
    [key: string]: string;
  };
  championsVerified: boolean;
}

export interface PokemonStats {
  name: string;
  dexNumber: number;
  form: string;
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
  total: number;
  championsVerified: boolean;
}

export interface PokemonWithStats {
  champion: PokemonChampion;
  stats: PokemonStats;
}

export interface CombatStat {
  name: string;
  value: number;
}

export type SortField = 'name' | 'dexNumber' | 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe' | 'total';
export type SortDirection = 'asc' | 'desc';
