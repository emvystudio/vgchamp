import React from 'react';
import { PokemonWithSpecies } from '../hooks/usePokemon';
import { XIcon } from '@heroicons/react/outline';

interface PokemonDetailProps {
  pokemon: PokemonWithSpecies | null;
  onClose: () => void;
}

const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemon, onClose }) => {
  if (!pokemon) return null;

  const { pokemon: p, species } = pokemon;

  const typeColors: Record<string, string> = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-cyan-400',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-500',
    bug: 'bg-lime-500',
    rock: 'bg-yellow-700',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-600',
    dark: 'bg-gray-800',
    steel: 'bg-gray-600',
    fairy: 'bg-pink-400',
    unknown: 'bg-gray-400',
  };

  const totalStats = p.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  const maxStat = Math.max(...p.stats.map(stat => stat.base_stat));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold capitalize">
            {p.name} #{p.id.toString().padStart(3, '0')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={p.sprites.front_default}
                  alt={p.name}
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/192x192?text=?';
                  }}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Types</h3>
                <div className="flex flex-wrap gap-2">
                  {p.types.map((type, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 text-white rounded-full ${typeColors[type.type.name] || typeColors.unknown}`}
                    >
                      {type.type.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Physical Stats</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="font-medium">Height:</span> {p.height / 10}m
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="font-medium">Weight:</span> {p.weight / 10}kg
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="font-medium">Base Exp:</span> {p.base_experience || 'N/A'}
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="font-medium">Total Stats:</span> {totalStats}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Base Stats</h3>
                <div className="space-y-2">
                  {p.stats.map((stat, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">
                          {stat.stat.name.replace('-', ' ')}
                        </span>
                        <span className="font-bold">{stat.base_stat}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(stat.base_stat / maxStat) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Abilities</h3>
                <div className="space-y-1">
                  {p.abilities.map((ability, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 text-sm ${
                        ability.is_hidden ? 'text-gray-500 italic' : ''
                      }`}
                    >
                      <span className="capitalize">{ability.ability.name.replace('-', ' ')}</span>
                      {ability.is_hidden && <span className="text-xs">(Hidden)</span>}
                    </div>
                  ))}
                </div>
              </div>

              {species.pokedex_numbers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Pokédex Entries</h3>
                  <div className="space-y-1">
                    {species.pokedex_numbers.map((pn, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium capitalize">
                          {pn.pokedex.name.replace('-', ' ')}:
                        </span>{' '}
                        #{pn.entry_number}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">Games</h3>
                <div className="flex flex-wrap gap-1">
                  {p.game_indices.slice(0, 10).map((game, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-xs rounded-full"
                    >
                      {game.version.name}
                    </span>
                  ))}
                  {p.game_indices.length > 10 && (
                    <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                      +{p.game_indices.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetail;
