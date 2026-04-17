import React, { useState, useMemo, useCallback } from 'react';
import { usePokemonChampions } from './hooks/usePokemonChampions';
import { usePokemonParty } from './hooks/usePokemonParty';
import PokemonChampionList from './components/PokemonChampionList';
import PokemonChampionDetail from './components/PokemonChampionDetail';
import PokemonPartyPanel from './components/PokemonPartyPanel';
import PokemonBackupPanel from './components/PokemonBackupPanel';
import InstantSearchBar from './components/InstantSearchBar';
import { PokemonWithStats } from './types/pokemonChampions';

function App() {
  const { pokemon, loading, error, refetch } = usePokemonChampions();
  const {
    party, backupParty, partyMoves,
    addToParty, removeFromParty, removeFromBackup,
    swapInParty, swapInBackup, clearParty, clearBackup,
    isInParty, updatePartyMove,
  } = usePokemonParty();

  const [selectedPokemon, setSelectedPokemon] = useState<PokemonWithStats | null>(null);
  const [selectedPartyIndex, setSelectedPartyIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [swapSlotIndex, setSwapSlotIndex] = useState<number | null>(null);
  const [isSwapMode, setIsSwapMode] = useState(false);
  const [similarToPartyIndex, setSimilarToPartyIndex] = useState<number | null>(null);

  const handlePokemonSelect = useCallback((p: PokemonWithStats) => {
    if (isSwapMode && swapSlotIndex !== null) {
      if (swapSlotIndex < 6) {
        swapInParty(swapSlotIndex, p);
      } else {
        swapInBackup(swapSlotIndex - 6, p);
      }
      setSwapSlotIndex(null);
      setIsSwapMode(false);
    } else {
      setSelectedPokemon(p);
      setSelectedPartyIndex(null);
    }
  }, [isSwapMode, swapSlotIndex, swapInParty, swapInBackup]);

  const handlePartySlotClick = useCallback((index: number) => {
    if (party[index]) {
      setSelectedPokemon(party[index]);
      setSelectedPartyIndex(index);
    }
  }, [party]);

  const handleAddToParty = useCallback((p: PokemonWithStats) => {
    if (!isInParty(p)) addToParty(p);
  }, [addToParty, isInParty]);

  const handleSwapInParty = useCallback((index: number) => {
    setSwapSlotIndex(index);
    setIsSwapMode(true);
  }, []);

  const handleSwapInBackup = useCallback((index: number) => {
    setSwapSlotIndex(index + 6);
    setIsSwapMode(true);
  }, []);

  const cancelSwap = useCallback(() => {
    setSwapSlotIndex(null);
    setIsSwapMode(false);
  }, []);

  const filteredPokemon = useMemo(() => {
    let result = pokemon;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.champion.name.toLowerCase().startsWith(q) ||
        p.champion.types.some(t => t.toLowerCase().startsWith(q)) ||
        Object.values(p.champion.abilities).some(a => a.toLowerCase().startsWith(q))
      );
    }

    if (similarToPartyIndex !== null && party[similarToPartyIndex]) {
      const ref = party[similarToPartyIndex]!;
      result = result.filter(p =>
        p.champion.types.some(t => ref.champion.types.includes(t))
      );
    }

    return result;
  }, [pokemon, searchQuery, similarToPartyIndex, party]);

  const activeSimilarPokemon = similarToPartyIndex !== null ? party[similarToPartyIndex] : null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-gray-800 shadow-xl">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <h1 className="text-base font-bold text-white tracking-tight whitespace-nowrap">
            Pokémon Champions
          </h1>
          <div className="flex-1 min-w-[160px] max-w-sm">
            <InstantSearchBar onSearch={setSearchQuery} />
          </div>
          <div className="flex items-center gap-2 ml-auto text-xs">
            {activeSimilarPokemon && (
              <span className="text-violet-400 font-medium">
                Similar to {activeSimilarPokemon.champion.name}
              </span>
            )}
            <span className="text-gray-500">{filteredPokemon.length} shown</span>
            {similarToPartyIndex !== null && (
              <button
                onClick={() => setSimilarToPartyIndex(null)}
                className="px-3 py-1.5 bg-violet-700 hover:bg-violet-600 text-white rounded-lg font-medium transition-colors"
              >
                Clear Filter
              </button>
            )}
            {isSwapMode ? (
              <button
                onClick={cancelSwap}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
              >
                Cancel Swap
              </button>
            ) : (
              <>
                <button
                  onClick={clearParty}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors border border-gray-700"
                >
                  Clear Party
                </button>
                <button
                  onClick={clearBackup}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors border border-gray-700"
                >
                  Clear Backup
                </button>
                <button
                  onClick={refetch}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Refresh
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 space-y-3">
        {/* Party — 2×3 grid */}
        <PokemonPartyPanel
          party={party}
          partyMoves={partyMoves}
          onRemoveFromParty={removeFromParty}
          onSwapInParty={handleSwapInParty}
          onSlotClick={handlePartySlotClick}
          onMoveUpdate={updatePartyMove}
          onFindSimilar={setSimilarToPartyIndex}
          isSwapMode={isSwapMode}
          similarToIndex={similarToPartyIndex}
        />

        {/* Backup — 1×6 compact strip */}
        <PokemonBackupPanel
          backupParty={backupParty}
          onRemoveFromBackup={removeFromBackup}
          onSwapInBackup={handleSwapInBackup}
          isSwapMode={isSwapMode}
        />

        {isSwapMode && (
          <div className="text-center py-2 bg-amber-950/50 border border-amber-700/60 rounded-xl text-amber-300 text-sm font-medium">
            Select a Pokémon below to swap into the highlighted slot
          </div>
        )}

        {/* Database */}
        <main>
          <PokemonChampionList
            pokemon={pokemon}
            filteredPokemon={filteredPokemon}
            loading={loading}
            error={error}
            onPokemonSelect={handlePokemonSelect}
            onAddToParty={handleAddToParty}
            showPartyActions={!isSwapMode}
            isSwapMode={isSwapMode}
            onSwapSelect={handlePokemonSelect}
          />
        </main>
      </div>

      {/* Detail modal */}
      <PokemonChampionDetail
        pokemon={selectedPokemon}
        partyMoves={selectedPartyIndex !== null ? (partyMoves[selectedPartyIndex] ?? null) : null}
        onClose={() => {
          setSelectedPokemon(null);
          setSelectedPartyIndex(null);
        }}
      />
    </div>
  );
}

export default App;
