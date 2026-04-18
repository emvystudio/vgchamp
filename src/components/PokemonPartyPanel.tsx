import React, { useMemo, useState } from 'react';
import { PokemonWithStats } from '../types/pokemonChampions';
import { TYPE_COLORS, getWeaknesses } from '../utils/typeEffectiveness';
import {
  analyzePartyWeaknesses,
  analyzeMoveOverlap,
  getMoveInputClass,
} from '../utils/synergyAnalysis';

interface PokemonPartyPanelProps {
  party: (PokemonWithStats | null)[];
  partyMoves: ([string, string, string, string] | null)[];
  onRemoveFromParty: (index: number) => void;
  onSwapInParty: (index: number) => void;
  onSlotClick: (index: number) => void;
  onMoveUpdate: (slotIndex: number, moveIndex: number, moveName: string) => void;
  onFindSimilar: (index: number) => void;
  isSwapMode: boolean;
  similarToIndex: number | null;
  onDropOnParty?: (pokemon: PokemonWithStats, targetIndex: number) => void;
  onDragStart?: (pokemon: PokemonWithStats, source: 'list' | 'party' | 'backup') => void;
  onDragEnd?: () => void;
}

function getPokemonImageUrl(dexNumber: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`;
}

const PokemonPartyPanel: React.FC<PokemonPartyPanelProps> = ({
  party,
  partyMoves,
  onRemoveFromParty,
  onSwapInParty,
  onSlotClick,
  onMoveUpdate,
  onFindSimilar,
  isSwapMode,
  similarToIndex,
  onDropOnParty,
  onDragStart,
  onDragEnd,
}) => {
  const [hoveredEmptyIndex, setHoveredEmptyIndex] = useState<number | null>(null);
  
  const weaknessAnalysis = useMemo(() => analyzePartyWeaknesses(party), [party]);
  const moveAnalysis = useMemo(
    () => analyzeMoveOverlap(partyMoves.map(m => (m ? Array.from(m) : null))),
    [partyMoves]
  );

  const filledCount = party.filter(Boolean).length;
  const hasAnyMoves = partyMoves.some(m => m?.some(v => v.trim()));

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (index: number) => {
    if (party[index] === null) {
      setHoveredEmptyIndex(index);
    }
  };

  const handleDragLeave = () => {
    setHoveredEmptyIndex(null);
  };

  const handleDragStart = (e: React.DragEvent, pokemon: PokemonWithStats) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(pokemon));
    if (onDragStart) {
      onDragStart(pokemon, 'party');
    }
  };

  const handleDragEnd = () => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleDropOnEmpty = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    try {
      const pokemon = JSON.parse(e.dataTransfer.getData('text/plain')) as PokemonWithStats;
      if (onDropOnParty) {
        onDropOnParty(pokemon, index);
      }
    } catch (err) {
      console.error('Failed to parse dropped data:', err);
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
      {/* Panel header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-200 tracking-wide uppercase">Party</h2>
          <span className="text-xs text-gray-500">{filledCount}/6</span>
        </div>
        {hasAnyMoves && moveAnalysis.duplicateMoves.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            {moveAnalysis.duplicateMoves.length} move conflict{moveAnalysis.duplicateMoves.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* 2×3 party grid */}
      <div className="p-3 grid grid-cols-3 gap-2">
        {party.map((pokemon, index) => {
          const moves = partyMoves[index] ?? ['', '', '', ''];
          const isSimilarTarget = similarToIndex === index;

          if (!pokemon) {
            return (
              <div
                key={index}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropOnEmpty(e, index)}
                className={`rounded-xl border-2 border-dashed min-h-[180px] flex flex-col items-center justify-center text-gray-700 transition-colors ${
                  hoveredEmptyIndex === index ? 'border-white bg-gray-700' : 'border-gray-800 hover:border-gray-700 hover:text-gray-600'
                }`}
              >
                <span className="text-3xl leading-none mb-1">+</span>
                <span className="text-xs">Empty</span>
              </div>
            );
          }

          const weaknesses = getWeaknesses(pokemon.champion.types);

          return (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, pokemon)}
              onDragEnd={handleDragEnd}
              className={`rounded-xl border transition-all duration-150 cursor-move ${
                isSimilarTarget
                  ? 'border-violet-500 bg-violet-950/30'
                  : isSwapMode
                  ? 'border-amber-700/60 bg-amber-950/20'
                  : 'border-gray-700 bg-gray-800/60'
              }`}
            >
              {/* Card top: sprite + info + controls */}
              <div className="flex items-start gap-2 p-2">
                <button
                  onClick={() => onSlotClick(index)}
                  className="flex-shrink-0 cursor-pointer rounded-lg hover:bg-gray-700/50 transition-colors p-0.5"
                  title="View details"
                >
                  <img
                    src={getPokemonImageUrl(pokemon.champion.dexNumber)}
                    alt={pokemon.champion.name}
                    className="w-14 h-14 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => onSlotClick(index)}
                    className="text-left w-full"
                    title="View details"
                  >
                    <div className="text-sm font-semibold text-gray-100 truncate leading-tight hover:text-white transition-colors">
                      {pokemon.champion.name}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      #{pokemon.champion.dexNumber.toString().padStart(3, '0')}
                      {pokemon.champion.form !== 'Base' && (
                        <span className="ml-1 text-gray-600">· {pokemon.champion.form}</span>
                      )}
                    </div>
                  </button>
                  {/* Types */}
                  <div className="flex flex-wrap gap-1 mb-1">
                    {pokemon.champion.types.map(type => (
                      <span
                        key={type}
                        className={`px-1.5 py-0.5 text-xs font-semibold rounded-md ${TYPE_COLORS[type] ?? 'bg-gray-600 text-white'}`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  {/* Weakness dots */}
                  <div className="flex flex-wrap gap-0.5">
                    {weaknesses.slice(0, 6).map(({ type, multiplier }) => {
                      const count = weaknessAnalysis.weaknessCount[type] ?? 0;
                      const isShared = count >= 2;
                      return (
                        <span
                          key={type}
                          title={`Weak to ${type} ×${multiplier}${isShared ? ` (shared by ${count})` : ''}`}
                          className={`px-1 py-0.5 text-xs rounded font-medium ${
                            multiplier >= 4
                              ? 'bg-red-600 text-white'
                              : isShared
                              ? 'bg-orange-600/80 text-white'
                              : 'bg-gray-700 text-gray-400'
                          }`}
                        >
                          {type.slice(0, 3)}
                          {multiplier >= 4 && '!!'}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => onRemoveFromParty(index)}
                    className="p-1 rounded-md bg-gray-700 hover:bg-red-700 text-gray-400 hover:text-white transition-colors"
                    title="Remove"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onSwapInParty(index)}
                    className={`p-1 rounded-md transition-colors ${
                      isSwapMode
                        ? 'bg-amber-600 text-white hover:bg-amber-500'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                    title="Swap"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onFindSimilar(index)}
                    className={`p-1 rounded-md transition-colors ${
                      isSimilarTarget
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-violet-800 hover:text-violet-300'
                    }`}
                    title="Filter database for similar Pokémon"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Stats and moves container */}
              <div className="px-2 pb-2 flex gap-2">
                {/* Stats section */}
                <div className="flex-1 space-y-1">
                  {/* Stat mini-bars */}
                  <div className="space-y-0.5">
                    {[
                      { label: 'ATK', value: pokemon.stats.atk },
                      { label: 'DEF', value: pokemon.stats.def },
                      { label: 'S.ATK', value: pokemon.stats.spa },
                      { label: 'S.DEF', value: pokemon.stats.spd },
                      { label: 'SPD', value: pokemon.stats.spe },
                    ].map(({ label, value }) => {
                      const maxStat = Math.max(pokemon.stats.atk, pokemon.stats.def, pokemon.stats.spa, pokemon.stats.spd, pokemon.stats.spe, 100);
                      return (
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
                      );
                    })}
                  </div>
                  
                  {/* Footer: HP + Total */}
                  <div className="pt-1 border-t border-gray-700/60 flex justify-between text-xs text-gray-500">
                    <span>HP <span className="text-gray-400 font-medium">{pokemon.stats.hp}</span></span>
                    <span>BST <span className="text-gray-400 font-medium">{pokemon.stats.total}</span></span>
                  </div>
                </div>
                
                {/* Move slots */}
                <div className="flex-1 space-y-1">
                  {moves.map((move, moveIndex) => (
                    <input
                      key={moveIndex}
                      type="text"
                      value={move}
                      placeholder={`Move ${moveIndex + 1}`}
                      onChange={e => onMoveUpdate(index, moveIndex, e.target.value)}
                      className={`w-full px-2 py-1 text-xs rounded-md border outline-none transition-colors ${getMoveInputClass(move, moveAnalysis)}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Synergy summary bar */}
      {(weaknessAnalysis.criticalWeaknesses.length > 0 || weaknessAnalysis.sharedWeaknesses.length > 0 || moveAnalysis.duplicateMoves.length > 0) && (
        <div className="px-4 py-2 border-t border-gray-800 bg-gray-950/60 flex flex-wrap items-start gap-x-4 gap-y-1.5 text-xs">
          {weaknessAnalysis.criticalWeaknesses.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-red-400 font-semibold uppercase tracking-wide">Critical weaknesses:</span>
              <div className="flex flex-wrap gap-1">
                {weaknessAnalysis.criticalWeaknesses.map(t => (
                  <span
                    key={t}
                    className={`px-1.5 py-0.5 rounded text-xs font-semibold ${TYPE_COLORS[t] ?? 'bg-gray-600 text-white'}`}
                  >
                    {t} ×{weaknessAnalysis.weaknessCount[t]}
                  </span>
                ))}
              </div>
            </div>
          )}
          {weaknessAnalysis.sharedWeaknesses.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-orange-400 font-semibold uppercase tracking-wide">Shared weaknesses:</span>
              <div className="flex flex-wrap gap-1">
                {weaknessAnalysis.sharedWeaknesses.map(t => (
                  <span
                    key={t}
                    className="px-1.5 py-0.5 rounded text-xs font-semibold bg-orange-800/60 text-orange-300"
                  >
                    {t} ×2
                  </span>
                ))}
              </div>
            </div>
          )}
          {moveAnalysis.duplicateMoves.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-red-400 font-semibold uppercase tracking-wide">Move conflicts:</span>
              <div className="flex flex-wrap gap-1">
                {moveAnalysis.duplicateMoves.map(m => (
                  <span key={m} className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-900/60 text-red-300 capitalize">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PokemonPartyPanel;
