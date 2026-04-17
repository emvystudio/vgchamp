import { useState, useCallback } from 'react';
import { PokemonWithStats } from '../types/pokemonChampions';

export interface UsePokemonPartyReturn {
  party: (PokemonWithStats | null)[];
  backupParty: (PokemonWithStats | null)[];
  partyMoves: ([string, string, string, string] | null)[];
  addToParty: (pokemon: PokemonWithStats) => void;
  removeFromParty: (index: number) => void;
  removeFromBackup: (index: number) => void;
  swapInParty: (index: number, pokemon: PokemonWithStats) => void;
  swapInBackup: (index: number, pokemon: PokemonWithStats) => void;
  clearParty: () => void;
  clearBackup: () => void;
  isPartyFull: boolean;
  isBackupFull: boolean;
  isInParty: (pokemon: PokemonWithStats) => boolean;
  isInBackup: (pokemon: PokemonWithStats) => boolean;
  updatePartyMove: (slotIndex: number, moveIndex: number, moveName: string) => void;
}

export const usePokemonParty = (): UsePokemonPartyReturn => {
  const [party, setParty] = useState<(PokemonWithStats | null)[]>(Array(6).fill(null));
  const [backupParty, setBackupParty] = useState<(PokemonWithStats | null)[]>(Array(6).fill(null));
  const [partyMoves, setPartyMoves] = useState<([string, string, string, string] | null)[]>(Array(6).fill(null));

  const addToParty = useCallback((pokemon: PokemonWithStats) => {
    setParty(current => {
      const next = [...current];
      const emptyIndex = next.findIndex(slot => slot === null);
      if (emptyIndex !== -1) {
        next[emptyIndex] = pokemon;
      } else {
        next[0] = pokemon;
      }
      return next;
    });
  }, []);

  const removeFromParty = useCallback((index: number) => {
    setParty(current => {
      const next = [...current];
      next[index] = null;
      return next;
    });
    setPartyMoves(current => {
      const next = [...current];
      next[index] = null;
      return next;
    });
  }, []);

  const removeFromBackup = useCallback((index: number) => {
    setBackupParty(current => {
      const next = [...current];
      next[index] = null;
      return next;
    });
  }, []);

  const swapInParty = useCallback((index: number, pokemon: PokemonWithStats) => {
    setParty(current => {
      const next = [...current];
      next[index] = pokemon;
      return next;
    });
    setPartyMoves(current => {
      const next = [...current];
      next[index] = null;
      return next;
    });
  }, []);

  const swapInBackup = useCallback((index: number, pokemon: PokemonWithStats) => {
    setBackupParty(current => {
      const next = [...current];
      next[index] = pokemon;
      return next;
    });
  }, []);

  const clearParty = useCallback(() => {
    setParty(Array(6).fill(null));
    setPartyMoves(Array(6).fill(null));
  }, []);

  const clearBackup = useCallback(() => {
    setBackupParty(Array(6).fill(null));
  }, []);

  const updatePartyMove = useCallback((slotIndex: number, moveIndex: number, moveName: string) => {
    setPartyMoves(current => {
      const next = [...current];
      const existing: [string, string, string, string] = next[slotIndex]
        ? ([...next[slotIndex]!] as [string, string, string, string])
        : ['', '', '', ''];
      existing[moveIndex] = moveName;
      next[slotIndex] = existing;
      return next;
    });
  }, []);

  const isPartyFull = party.every(slot => slot !== null);
  const isBackupFull = backupParty.every(slot => slot !== null);

  const isInParty = useCallback((pokemon: PokemonWithStats) => {
    return party.some(
      slot => slot?.champion.name === pokemon.champion.name && slot?.champion.form === pokemon.champion.form
    );
  }, [party]);

  const isInBackup = useCallback((pokemon: PokemonWithStats) => {
    return backupParty.some(
      slot => slot?.champion.name === pokemon.champion.name && slot?.champion.form === pokemon.champion.form
    );
  }, [backupParty]);

  return {
    party,
    backupParty,
    partyMoves,
    addToParty,
    removeFromParty,
    removeFromBackup,
    swapInParty,
    swapInBackup,
    clearParty,
    clearBackup,
    isPartyFull,
    isBackupFull,
    isInParty,
    isInBackup,
    updatePartyMove,
  };
};
