import React, { useState, useMemo, useCallback } from 'react';
import { usePokemonChampions } from './hooks/usePokemonChampions';
import { usePokemonParty } from './hooks/usePokemonParty';
import PokemonChampionList from './components/PokemonChampionList';
import PokemonChampionDetail from './components/PokemonChampionDetail';
import PokemonPartyPanel from './components/PokemonPartyPanel';
import PokemonBackupPanel from './components/PokemonBackupPanel';
import { PokemonWithStats } from './types/pokemonChampions';

function App() {
  const { pokemon, loading, error, refetch } = usePokemonChampions();
  const {
    party, backupParty, partyMoves,
    addToParty, addToBackup, removeFromParty, removeFromBackup,
    swapInParty, swapInBackup, clearParty, clearBackup,
    isInParty, updatePartyMove,
  } = usePokemonParty();

  const [selectedPokemon, setSelectedPokemon] = useState<PokemonWithStats | null>(null);
  const [selectedPartyIndex, setSelectedPartyIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [swapSlotIndex, setSwapSlotIndex] = useState<number | null>(null);
  const [isSwapMode, setIsSwapMode] = useState(false);
  const [similarToPartyIndex, setSimilarToPartyIndex] = useState<number | null>(null);
  const [filterToggles, setFilterToggles] = useState({
    name: true,
    type: true,
    ability: true,
  });

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
    if (!isInParty(p) && !backupParty.some(bp => bp?.champion.name === p.champion.name && bp?.champion.form === p.champion.form)) {
      if (party.filter(Boolean).length < 6) {
        addToParty(p);
      } else {
        // Party is full, add to backup
        addToBackup(p);
      }
    }
  }, [addToParty, addToBackup, isInParty, party, backupParty]);

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

  const [dragSource, setDragSource] = useState<'list' | 'party' | 'backup' | null>(null);

  const handleDragStart = useCallback((pokemon: PokemonWithStats, source: 'list' | 'party' | 'backup') => {
    // Store the dragged pokemon and source for drop handling
    setDragSource(source);
  }, []);

  const handleDropOnParty = useCallback((pokemon: PokemonWithStats, targetIndex: number) => {
    const targetPokemon = party[targetIndex];
    
    if (dragSource === 'backup') {
      // Move backup Pokémon to party
      const backupIndex = backupParty.findIndex(bp => bp?.champion.name === pokemon.champion.name && bp?.champion.form === pokemon.champion.form);
      if (backupIndex !== -1) {
        if (targetPokemon) {
          // Swap with party Pokémon
          swapInParty(targetIndex, pokemon);
          swapInBackup(backupIndex, targetPokemon);
        } else {
          // Move to empty party slot
          swapInParty(targetIndex, pokemon);
          removeFromBackup(backupIndex);
        }
      }
    } else if (!isInParty(pokemon)) {
      if (targetPokemon) {
        // Swap with existing party Pokémon
        swapInParty(targetIndex, pokemon);
      } else {
        // Empty slot, add to party
        swapInParty(targetIndex, pokemon);
      }
    }
    setDragSource(null);
  }, [party, backupParty, dragSource, isInParty, swapInParty, swapInBackup]);

  
  const handleDropOnList = useCallback((pokemon: PokemonWithStats) => {
    if (dragSource === 'party') {
      // Remove from party if it was dragged from party
      removeFromParty(party.findIndex(p => p?.champion.name === pokemon.champion.name && p?.champion.form === pokemon.champion.form));
    } else if (dragSource === 'backup') {
      // Remove from backup if it was dragged from backup
      removeFromBackup(backupParty.findIndex(p => p?.champion.name === pokemon.champion.name && p?.champion.form === pokemon.champion.form));
    }
    setDragSource(null);
  }, [party, backupParty, dragSource, removeFromParty, removeFromBackup]);

  const handleDropOnBackup = useCallback((pokemon: PokemonWithStats, targetIndex: number) => {
    const targetPokemon = backupParty[targetIndex];
    
    if (dragSource === 'party') {
      // Move party Pokémon to backup
      const partyIndex = party.findIndex(p => p?.champion.name === pokemon.champion.name && p?.champion.form === pokemon.champion.form);
      if (partyIndex !== -1) {
        if (targetPokemon) {
          // Swap with backup Pokémon
          swapInBackup(targetIndex, pokemon);
          swapInParty(partyIndex, targetPokemon);
        } else {
          // Move to empty backup slot
          swapInBackup(targetIndex, pokemon);
          removeFromParty(partyIndex);
        }
      }
    } else if (!isInParty(pokemon) && !backupParty.some(p => p?.champion.name === pokemon.champion.name && p?.champion.form === pokemon.champion.form)) {
      if (targetPokemon) {
        // Swap with existing backup Pokémon
        swapInBackup(targetIndex, pokemon);
      } else {
        // Empty slot, add to backup
        swapInBackup(targetIndex, pokemon);
      }
    }
    setDragSource(null);
  }, [party, backupParty, dragSource, isInParty, swapInParty, swapInBackup]);

  const filteredPokemon = useMemo(() => {
    let result = pokemon;

    // Hide Pokémon that are already in the party or backup
    const partyPokemonNames = new Set(
      party.filter(p => p !== null).map(p => `${p!.champion.name}-${p!.champion.form}`)
    );
    const backupPokemonNames = new Set(
      backupParty.filter(p => p !== null).map(p => `${p!.champion.name}-${p!.champion.form}`)
    );
    result = result.filter(p => 
      !partyPokemonNames.has(`${p.champion.name}-${p.champion.form}`) &&
      !backupPokemonNames.has(`${p.champion.name}-${p.champion.form}`)
    );

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => {
        const nameMatch = filterToggles.name && p.champion.name.toLowerCase().startsWith(q);
        const typeMatch = filterToggles.type && p.champion.types.some(t => t.toLowerCase().startsWith(q));
        const abilityMatch = filterToggles.ability && Object.values(p.champion.abilities).some(a => a.toLowerCase().startsWith(q));
        
        return nameMatch || typeMatch || abilityMatch;
      });
    }

    if (similarToPartyIndex !== null && party[similarToPartyIndex]) {
      const ref = party[similarToPartyIndex]!;
      result = result.filter(p =>
        p.champion.types.some(t => ref.champion.types.includes(t))
      );
    }

    return result;
  }, [pokemon, searchQuery, similarToPartyIndex, party, backupParty, filterToggles]);

  const activeSimilarPokemon = similarToPartyIndex !== null ? party[similarToPartyIndex] : null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-gray-800 shadow-xl">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <h1 className="text-base font-bold text-white tracking-tight whitespace-nowrap">
            VGChamp
          </h1>
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
          onDropOnParty={handleDropOnParty}
          onDragStart={handleDragStart}
          onDragEnd={() => {
            setDragSource(null);
          }}
        />

        {/* Backup — 1×6 compact strip */}
        <PokemonBackupPanel
          backupParty={backupParty}
          onRemoveFromBackup={removeFromBackup}
          onSwapInBackup={handleSwapInBackup}
          isSwapMode={isSwapMode}
          onDropOnBackup={handleDropOnBackup}
          onDragStart={handleDragStart}
          onDragEnd={() => {
            setDragSource(null);
          }}
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
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterToggles={filterToggles}
            onFilterToggleChange={setFilterToggles}
            onDragStart={handleDragStart}
            onDragEnd={() => {
                            setDragSource(null);
            }}
            onDropOnList={handleDropOnList}
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
