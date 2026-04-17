import React from 'react';
import { PokemonWithStats } from '../types/pokemonChampions';
import { TYPE_COLORS } from '../utils/typeEffectiveness';

interface PokemonBackupPanelProps {
  backupParty: (PokemonWithStats | null)[];
  onRemoveFromBackup: (index: number) => void;
  onSwapInBackup: (index: number) => void;
  isSwapMode: boolean;
}

function getPokemonImageUrl(dexNumber: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`;
}

const PokemonBackupPanel: React.FC<PokemonBackupPanelProps> = ({
  backupParty,
  onRemoveFromBackup,
  onSwapInBackup,
  isSwapMode,
}) => {
  const filledCount = backupParty.filter(Boolean).length;
  if (filledCount === 0) return null;

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="px-4 pt-2 pb-1.5 flex items-center gap-2 border-b border-gray-800">
        <h3 className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Backup / Extra Slots</h3>
        <span className="text-xs text-gray-600">{filledCount}/6</span>
      </div>

      <div className="p-2 grid grid-cols-6 gap-1.5">
        {backupParty.map((pokemon, index) => {
          if (!pokemon) {
            return (
              <div
                key={index}
                className="rounded-lg border border-dashed border-gray-800 h-16 flex items-center justify-center text-gray-800 text-lg"
              >
                +
              </div>
            );
          }

          return (
            <div
              key={index}
              className={`relative rounded-lg border transition-colors group ${
                isSwapMode
                  ? 'border-amber-700/60 bg-amber-950/20'
                  : 'border-gray-700 bg-gray-800/60 hover:border-gray-600'
              }`}
            >
              {/* Controls — visible on hover */}
              <div className="absolute top-0.5 right-0.5 hidden group-hover:flex gap-0.5 z-10">
                <button
                  onClick={() => onSwapInBackup(index)}
                  className={`p-0.5 rounded transition-colors ${
                    isSwapMode
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                  title="Swap"
                >
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
                <button
                  onClick={() => onRemoveFromBackup(index)}
                  className="p-0.5 rounded bg-gray-700 text-gray-400 hover:bg-red-700 hover:text-white transition-colors"
                  title="Remove"
                >
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-1.5 flex flex-col items-center gap-1">
                <img
                  src={getPokemonImageUrl(pokemon.champion.dexNumber)}
                  alt={pokemon.champion.name}
                  className="w-10 h-10 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="text-center">
                  <div className="text-xs text-gray-300 font-medium truncate w-full leading-tight" title={pokemon.champion.name}>
                    {pokemon.champion.name.length > 8
                      ? pokemon.champion.name.slice(0, 7) + '…'
                      : pokemon.champion.name}
                  </div>
                  <div className="flex justify-center gap-0.5 mt-0.5 flex-wrap">
                    {pokemon.champion.types.map(type => (
                      <span
                        key={type}
                        className={`w-1.5 h-1.5 rounded-full inline-block ${TYPE_COLORS[type]?.split(' ')[0] ?? 'bg-gray-500'}`}
                        title={type}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PokemonBackupPanel;
