import React from 'react';
import { PokemonWithStats } from '../types/pokemonChampions';
import { TYPE_COLORS } from '../utils/typeEffectiveness';

interface PokemonChampionCardProps {
  pokemon: PokemonWithStats;
  onClick: (pokemon: PokemonWithStats) => void;
  showPartyActions?: boolean;
  onAddToParty?: (pokemon: PokemonWithStats) => void;
  isSwapMode?: boolean;
  onSwapSelect?: (pokemon: PokemonWithStats) => void;
}

function getPokemonImageUrl(dexNumber: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`;
}

const ABILITY_COLORS = [
  'bg-orange-900/60 text-orange-300 border-orange-700/50',
  'bg-teal-900/60 text-teal-300 border-teal-700/50',
  'bg-sky-900/60 text-sky-300 border-sky-700/50',
  'bg-rose-900/60 text-rose-300 border-rose-700/50',
  'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
  'bg-violet-900/60 text-violet-300 border-violet-700/50',
  'bg-amber-900/60 text-amber-300 border-amber-700/50',
  'bg-fuchsia-900/60 text-fuchsia-300 border-fuchsia-700/50',
];

function getAbilityColor(name: string): string {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ABILITY_COLORS[hash % ABILITY_COLORS.length];
}

const PokemonChampionCard: React.FC<PokemonChampionCardProps> = ({
  pokemon,
  onClick,
  showPartyActions = false,
  onAddToParty,
  isSwapMode = false,
  onSwapSelect,
}) => {
  const { champion, stats } = pokemon;

  const handleClick = () => {
    if (isSwapMode && onSwapSelect) {
      onSwapSelect(pokemon);
    } else if (showPartyActions && onAddToParty) {
      onAddToParty(pokemon);
    } else {
      onClick(pokemon);
    }
  };

  const statBars = [
    { label: 'ATK', value: stats.atk },
    { label: 'DEF', value: stats.def },
    { label: 'S.ATK', value: stats.spa },
    { label: 'S.DEF', value: stats.spd },
    { label: 'SPD', value: stats.spe },
  ];
  const maxStat = Math.max(...statBars.map(s => s.value), 100);

  return (
    <div
      onClick={handleClick}
      className={`bg-gray-800 border rounded-xl p-3 cursor-pointer transition-all duration-150 hover:shadow-lg hover:shadow-black/30 group ${
        isSwapMode
          ? 'border-amber-600/60 hover:border-amber-500 hover:bg-amber-950/20'
          : 'border-gray-700 hover:border-blue-500/60 hover:bg-gray-750'
      }`}
    >
      {/* Header: sprite + name */}
      <div className="flex items-center gap-3 mb-2">
        <img
          src={getPokemonImageUrl(champion.dexNumber)}
          alt={champion.name}
          className="w-14 h-14 object-contain flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="min-w-0">
          <div className="font-semibold text-gray-100 text-sm truncate group-hover:text-white transition-colors">
            {champion.name}
          </div>
          <div className="text-xs text-gray-500">
            #{champion.dexNumber.toString().padStart(3, '0')}
            {champion.form !== 'Base' && <span className="ml-1 text-gray-600">· {champion.form}</span>}
          </div>
          {/* Types */}
          <div className="flex flex-wrap gap-1 mt-1">
            {champion.types.map(type => (
              <span
                key={type}
                className={`px-1.5 py-0.5 text-xs font-semibold rounded-md ${TYPE_COLORS[type] ?? 'bg-gray-600 text-white'}`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Abilities */}
      <div className="flex flex-wrap gap-1 mb-2">
        {Object.entries(champion.abilities).map(([slot, ability]) => (
          <span
            key={slot}
            className={`px-1.5 py-0.5 text-xs rounded border ${getAbilityColor(ability)} ${
              slot.toLowerCase() === 'h' ? 'opacity-60' : ''
            }`}
          >
            {ability.replace(/-/g, ' ')}
            {slot.toLowerCase() === 'h' && <span className="ml-0.5 opacity-70">(H)</span>}
          </span>
        ))}
      </div>

      {/* Stat mini-bars */}
      <div className="space-y-0.5">
        {statBars.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 w-10 text-right flex-shrink-0">{label}</span>
            <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${(value / maxStat) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-7 text-right flex-shrink-0">{value}</span>
          </div>
        ))}
      </div>

      {/* Footer: HP + Total */}
      <div className="mt-2 pt-2 border-t border-gray-700/60 flex justify-between text-xs text-gray-500">
        <span>HP <span className="text-gray-400 font-medium">{stats.hp}</span></span>
        <span>BST <span className="text-gray-400 font-medium">{stats.total}</span></span>
      </div>

      {/* Swap mode indicator */}
      {isSwapMode && (
        <div className="mt-1.5 text-center text-xs text-amber-400 font-medium">
          Click to swap in
        </div>
      )}
    </div>
  );
};

export default PokemonChampionCard;
