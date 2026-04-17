import React from 'react';
import { PokemonWithStats } from '../types/pokemonChampions';
import { TYPE_COLORS, getWeaknesses, getResistances, getImmunities } from '../utils/typeEffectiveness';

interface PokemonChampionDetailProps {
  pokemon: PokemonWithStats | null;
  partyMoves: [string, string, string, string] | null;
  onClose: () => void;
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

function getPokemonImageUrl(dexNumber: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`;
}

const STAT_COLORS: Record<string, string> = {
  HP:  'bg-red-500',
  Atk: 'bg-orange-500',
  Def: 'bg-yellow-500',
  SpA: 'bg-blue-500',
  SpD: 'bg-teal-500',
  Spe: 'bg-pink-500',
};

function statColor(label: string): string {
  return STAT_COLORS[label] ?? 'bg-blue-500';
}

const PokemonChampionDetail: React.FC<PokemonChampionDetailProps> = ({
  pokemon,
  partyMoves,
  onClose,
}) => {
  if (!pokemon) return null;

  const { champion, stats } = pokemon;

  const weaknesses   = getWeaknesses(champion.types);
  const resistances  = getResistances(champion.types);
  const immunities   = getImmunities(champion.types);

  const combatStats = [
    { label: 'HP',  value: stats.hp },
    { label: 'Atk', value: stats.atk },
    { label: 'Def', value: stats.def },
    { label: 'SpA', value: stats.spa },
    { label: 'SpD', value: stats.spd },
    { label: 'Spe', value: stats.spe },
  ];
  const maxStat = Math.max(...combatStats.map(s => s.value));

  const assignedMoves = partyMoves?.filter(m => m.trim()) ?? [];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-gray-700 px-5 py-3 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-white">{champion.name}</h2>
            <p className="text-xs text-gray-400">
              #{champion.dexNumber.toString().padStart(3, '0')}
              {champion.form !== 'Base' && <span className="ml-1">· {champion.form}</span>}
              <span className="ml-2 text-gray-500">BST {stats.total}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left column */}
            <div className="space-y-4">
              {/* Sprite + types */}
              <div className="flex items-center gap-4">
                <img
                  src={getPokemonImageUrl(champion.dexNumber)}
                  alt={champion.name}
                  className="w-28 h-28 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {champion.types.map(type => (
                      <span
                        key={type}
                        className={`px-2.5 py-1 rounded-lg text-sm font-semibold ${TYPE_COLORS[type] ?? 'bg-gray-600 text-white'}`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  {champion.championsVerified && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Champions verified
                    </span>
                  )}
                </div>
              </div>

              {/* Abilities */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Abilities</h3>
                <div className="space-y-1">
                  {Object.entries(champion.abilities).map(([slot, ability]) => (
                    <div
                      key={slot}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-sm ${getAbilityColor(ability)} ${
                        slot.toLowerCase() === 'h' ? 'opacity-60' : ''
                      }`}
                    >
                      <span className="font-medium">{ability.replace(/-/g, ' ')}</span>
                      <span className="text-xs opacity-60 ml-auto">
                        {slot.toLowerCase() === 'h' ? 'Hidden' : `Slot ${slot}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned moves (from party) */}
              {assignedMoves.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Assigned Moves
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedMoves.map((move, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-blue-900/50 border border-blue-700/60 text-blue-300 text-xs rounded-lg font-medium"
                      >
                        {move}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column: stats */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Base Stats</h3>
              <div className="space-y-2">
                {combatStats.map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-8 text-right flex-shrink-0">{label}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${statColor(label)}`}
                        style={{ width: `${(value / maxStat) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-300 w-8 flex-shrink-0">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Type matchups */}
          <div className="space-y-3">
            {weaknesses.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Weaknesses</h3>
                <div className="flex flex-wrap gap-1.5">
                  {weaknesses.map(({ type, multiplier }) => (
                    <span
                      key={type}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${TYPE_COLORS[type] ?? 'bg-gray-600 text-white'}`}
                    >
                      {type}
                      <span className="ml-1 opacity-80">×{multiplier}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {resistances.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Resistances</h3>
                <div className="flex flex-wrap gap-1.5">
                  {resistances.map(({ type, multiplier }) => (
                    <span
                      key={type}
                      className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600"
                    >
                      {type}
                      <span className="ml-1 text-gray-500">
                        ×{multiplier === 0.25 ? '¼' : multiplier === 0.5 ? '½' : multiplier}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {immunities.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Immunities</h3>
                <div className="flex flex-wrap gap-1.5">
                  {immunities.map(({ type }) => (
                    <span
                      key={type}
                      className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-800 text-gray-500 border border-gray-700 line-through"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonChampionDetail;
