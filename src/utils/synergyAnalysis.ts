import { PokemonWithStats } from '../types/pokemonChampions';
import { ALL_TYPES, getTypeEffectiveness } from './typeEffectiveness';

export interface PartyWeaknessAnalysis {
  weaknessCount: Record<string, number>;
  criticalWeaknesses: string[]; // 3+ party members weak to this type
  sharedWeaknesses: string[];   // exactly 2 party members weak to this type
}

export interface MoveOverlapAnalysis {
  moveToSlots: Record<string, number[]>; // normalized move name -> slot indices
  duplicateMoves: string[];
}

export function analyzePartyWeaknesses(party: (PokemonWithStats | null)[]): PartyWeaknessAnalysis {
  const weaknessCount: Record<string, number> = {};
  for (const t of ALL_TYPES) weaknessCount[t] = 0;

  for (const pokemon of party) {
    if (!pokemon) continue;
    for (const t of ALL_TYPES) {
      if (getTypeEffectiveness(t, pokemon.champion.types) > 1) {
        weaknessCount[t]++;
      }
    }
  }

  const criticalWeaknesses = (ALL_TYPES as readonly string[]).filter(t => weaknessCount[t] >= 3);
  const sharedWeaknesses = (ALL_TYPES as readonly string[]).filter(t => weaknessCount[t] === 2);

  return { weaknessCount, criticalWeaknesses, sharedWeaknesses };
}

export function analyzeMoveOverlap(partyMoves: (string[] | null)[]): MoveOverlapAnalysis {
  const moveToSlots: Record<string, number[]> = {};

  partyMoves.forEach((moves, slotIndex) => {
    if (!moves) return;
    moves.forEach(move => {
      const key = move.trim().toLowerCase();
      if (!key) return;
      if (!moveToSlots[key]) moveToSlots[key] = [];
      if (!moveToSlots[key].includes(slotIndex)) moveToSlots[key].push(slotIndex);
    });
  });

  const duplicateMoves = Object.keys(moveToSlots).filter(m => moveToSlots[m].length > 1);
  return { moveToSlots, duplicateMoves };
}

export function getMoveInputClass(moveName: string, analysis: MoveOverlapAnalysis): string {
  const key = moveName.trim().toLowerCase();
  if (!key) {
    return 'border-gray-700 bg-gray-800 text-gray-300 placeholder-gray-600 focus:border-gray-500';
  }
  if (analysis.duplicateMoves.includes(key)) {
    return 'border-red-500 bg-red-950/60 text-red-300 placeholder-gray-600 focus:border-red-400';
  }
  return 'border-green-700 bg-green-950/60 text-green-300 placeholder-gray-600 focus:border-green-500';
}
