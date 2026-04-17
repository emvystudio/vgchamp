import React from 'react';
import { PokemonWithSpecies } from '../hooks/usePokemon';

interface PokemonCardProps {
  pokemon: PokemonWithSpecies;
  onClick: (pokemon: PokemonWithSpecies) => void;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onClick }) => {
  const { pokemon: p } = pokemon;
  
  const typeColors: Record<string, string> = {
    normal: 'bg-gray-400 hover:bg-gray-500',
    fire: 'bg-red-500 hover:bg-red-600',
    water: 'bg-blue-500 hover:bg-blue-600',
    electric: 'bg-yellow-400 hover:bg-yellow-500',
    grass: 'bg-green-500 hover:bg-green-600',
    ice: 'bg-cyan-400 hover:bg-cyan-500',
    fighting: 'bg-red-700 hover:bg-red-800',
    poison: 'bg-purple-500 hover:bg-purple-600',
    ground: 'bg-yellow-600 hover:bg-yellow-700',
    flying: 'bg-indigo-400 hover:bg-indigo-500',
    psychic: 'bg-pink-500 hover:bg-pink-600',
    bug: 'bg-lime-500 hover:bg-lime-600',
    rock: 'bg-yellow-700 hover:bg-yellow-800',
    ghost: 'bg-purple-700 hover:bg-purple-800',
    dragon: 'bg-indigo-600 hover:bg-indigo-700',
    dark: 'bg-gray-800 hover:bg-gray-900',
    steel: 'bg-gray-600 hover:bg-gray-700',
    fairy: 'bg-pink-400 hover:bg-pink-500',
    unknown: 'bg-gray-400 hover:bg-gray-500',
  };

  const abilityColors: string[] = [
    'bg-orange-400 hover:bg-orange-500',
    'bg-teal-400 hover:bg-teal-500',
    'bg-amber-400 hover:bg-amber-500',
    'bg-rose-400 hover:bg-rose-500',
    'bg-sky-400 hover:bg-sky-500',
    'bg-emerald-400 hover:bg-emerald-500',
    'bg-violet-400 hover:bg-violet-500',
    'bg-fuchsia-400 hover:bg-fuchsia-500',
  ];

  const getAbilityColor = (abilityName: string) => {
    const hash = abilityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return abilityColors[hash % abilityColors.length];
  };

  const combatStats = p.stats.filter(stat => 
    ['attack', 'defense', 'special-attack', 'special-defense', 'speed'].includes(stat.stat.name)
  );

  const getStatName = (statName: string) => {
    const nameMap: Record<string, string> = {
      'attack': 'ATK',
      'defense': 'DEF',
      'special-attack': 'SP.ATK',
      'special-defense': 'SP.DEF',
      'speed': 'SPD'
    };
    return nameMap[statName] || statName.toUpperCase();
  };

  return (
    <div
      className="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all duration-200 hover:border-blue-400 min-w-[320px] max-w-[400px]"
      onClick={() => onClick(pokemon)}
    >
      <div className="space-y-3">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 capitalize">
            {p.name}
          </h3>
          <span className="text-sm text-gray-500">#{p.id.toString().padStart(3, '0')}</span>
        </div>

        <div className="flex flex-wrap justify-center gap-1">
          {p.types.map((type, index) => (
            <button
              key={index}
              className={`px-3 py-1 text-xs text-white rounded-full font-semibold transition-colors ${typeColors[type.type.name] || typeColors.unknown}`}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {type.type.name}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <img
              src={p.sprites.front_default}
              alt={p.name}
              className="w-24 h-24 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96x96?text=?';
              }}
            />
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Abilities:</div>
              <div className="flex flex-wrap gap-1">
                {p.abilities.slice(0, 2).map((ability, index) => (
                  <button
                    key={index}
                    className={`px-2 py-1 text-xs text-white rounded font-medium transition-colors ${getAbilityColor(ability.ability.name)} ${ability.is_hidden ? 'opacity-75' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {ability.ability.name.replace('-', ' ')}
                    {ability.is_hidden && ' (H)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Combat Stats:</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {combatStats.map((stat, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="font-medium">{getStatName(stat.stat.name)}:</span>
                    <span className="font-bold text-gray-700">{stat.base_stat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-600 border-t pt-2">
          <span>Height: {p.height / 10}m</span>
          <span>Weight: {p.weight / 10}kg</span>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
