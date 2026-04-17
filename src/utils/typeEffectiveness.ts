export const ALL_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy',
] as const;

export type PokemonType = typeof ALL_TYPES[number];

// defenseChart[defendingType][attackingType] = multiplier
const defenseChart: Record<string, Record<string, number>> = {
  Normal:   { Fighting: 2, Ghost: 0 },
  Fire:     { Fire: 0.5, Water: 2, Grass: 0.5, Ice: 0.5, Ground: 2, Bug: 0.5, Rock: 2, Steel: 0.5, Fairy: 0.5 },
  Water:    { Fire: 0.5, Water: 0.5, Electric: 2, Grass: 2, Ice: 0.5, Steel: 0.5 },
  Electric: { Electric: 0.5, Ground: 2, Flying: 0.5, Steel: 0.5 },
  Grass:    { Fire: 2, Water: 0.5, Electric: 0.5, Grass: 0.5, Ice: 2, Poison: 2, Ground: 0.5, Flying: 2, Bug: 2 },
  Ice:      { Fire: 2, Ice: 0.5, Fighting: 2, Rock: 2, Steel: 2 },
  Fighting: { Flying: 2, Psychic: 2, Bug: 0.5, Rock: 0.5, Dark: 0.5, Fairy: 2 },
  Poison:   { Grass: 0.5, Fighting: 0.5, Poison: 0.5, Ground: 2, Psychic: 2, Bug: 0.5, Fairy: 0.5 },
  Ground:   { Water: 2, Electric: 0, Grass: 2, Ice: 2, Poison: 0.5, Rock: 0.5 },
  Flying:   { Electric: 2, Grass: 0.5, Ice: 2, Fighting: 0.5, Ground: 0, Bug: 0.5, Rock: 2 },
  Psychic:  { Fighting: 0.5, Psychic: 0.5, Bug: 2, Ghost: 2, Dark: 2 },
  Bug:      { Fire: 2, Grass: 0.5, Fighting: 0.5, Ground: 0.5, Flying: 2, Rock: 2 },
  Rock:     { Normal: 0.5, Fire: 0.5, Water: 2, Grass: 2, Fighting: 2, Poison: 0.5, Ground: 2, Flying: 0.5, Steel: 2 },
  Ghost:    { Normal: 0, Fighting: 0, Poison: 0.5, Bug: 0.5, Ghost: 2, Dark: 2 },
  Dragon:   { Fire: 0.5, Water: 0.5, Electric: 0.5, Grass: 0.5, Ice: 2, Dragon: 2, Fairy: 2 },
  Dark:     { Fighting: 2, Psychic: 0, Bug: 2, Ghost: 0.5, Dark: 0.5, Fairy: 2 },
  Steel:    { Normal: 0.5, Fire: 2, Grass: 0.5, Ice: 0.5, Fighting: 2, Poison: 0, Ground: 2, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 0.5, Dragon: 0.5, Steel: 0.5, Fairy: 0.5 },
  Fairy:    { Fighting: 0.5, Poison: 2, Bug: 0.5, Dragon: 0, Dark: 0.5, Steel: 2 },
};

export const TYPE_COLORS: Record<string, string> = {
  Normal:   'bg-gray-500 text-white',
  Fire:     'bg-orange-500 text-white',
  Water:    'bg-blue-500 text-white',
  Electric: 'bg-yellow-400 text-gray-900',
  Grass:    'bg-green-500 text-white',
  Ice:      'bg-cyan-400 text-gray-900',
  Fighting: 'bg-red-600 text-white',
  Poison:   'bg-purple-500 text-white',
  Ground:   'bg-amber-600 text-white',
  Flying:   'bg-indigo-400 text-white',
  Psychic:  'bg-pink-500 text-white',
  Bug:      'bg-lime-500 text-gray-900',
  Rock:     'bg-yellow-700 text-white',
  Ghost:    'bg-purple-700 text-white',
  Dragon:   'bg-violet-600 text-white',
  Dark:     'bg-gray-700 text-white',
  Steel:    'bg-slate-500 text-white',
  Fairy:    'bg-pink-400 text-white',
};

export function getTypeEffectiveness(attackingType: string, defenderTypes: string[]): number {
  return defenderTypes.reduce((mult, defType) => {
    const chart = defenseChart[defType] || {};
    return mult * (chart[attackingType] ?? 1);
  }, 1);
}

export interface TypeMatchup {
  type: string;
  multiplier: number;
}

export function getWeaknesses(defenderTypes: string[]): TypeMatchup[] {
  return (ALL_TYPES as readonly string[])
    .map(t => ({ type: t, multiplier: getTypeEffectiveness(t, defenderTypes) }))
    .filter(m => m.multiplier > 1)
    .sort((a, b) => b.multiplier - a.multiplier);
}

export function getResistances(defenderTypes: string[]): TypeMatchup[] {
  return (ALL_TYPES as readonly string[])
    .map(t => ({ type: t, multiplier: getTypeEffectiveness(t, defenderTypes) }))
    .filter(m => m.multiplier < 1 && m.multiplier > 0)
    .sort((a, b) => a.multiplier - b.multiplier);
}

export function getImmunities(defenderTypes: string[]): TypeMatchup[] {
  return (ALL_TYPES as readonly string[])
    .map(t => ({ type: t, multiplier: getTypeEffectiveness(t, defenderTypes) }))
    .filter(m => m.multiplier === 0);
}
