/**
 * Maps tournament bracket data into left/right wing columns for the symmetric
 * knockout UI (World Cup 2026, EURO 2024).
 */

import type { PlayoffBracket, PlayoffSlot } from './types';

export interface BracketColumn {
  roundLabel: string;
  slots: PlayoffSlot[];
}

export interface SymmetricKnockoutLayout {
  subtitle: string;
  /** Columns from outside toward center (far left → semi). */
  leftColumns: BracketColumn[];
  /** Columns from center toward outside (semi → far right). */
  rightColumns: BracketColumn[];
  finalSlot: PlayoffSlot;
}

function slotMap(bracket: PlayoffBracket): Map<string, PlayoffSlot> {
  const m = new Map<string, PlayoffSlot>();
  for (const r of bracket.rounds) {
    for (const s of r.slots) {
      m.set(s.id, s);
    }
  }
  return m;
}

function pick(ids: string[], map: Map<string, PlayoffSlot>): PlayoffSlot[] {
  return ids.map((id) => {
    const s = map.get(id);
    if (!s) {
      throw new Error(`Playoff bracket missing slot id "${id}"`);
    }
    return s;
  });
}

function finalSlotFromBracket(bracket: PlayoffBracket): PlayoffSlot {
  const last = bracket.rounds[bracket.rounds.length - 1];
  const slot = last?.slots[0];
  if (!slot) {
    throw new Error('Playoff bracket must end with a round containing at least one slot');
  }
  return slot;
}

const WC_SUB =
  'Round of 32 → Final • Single elimination';
const EURO_SUB =
  'Round of 16 → Final • Single elimination';

/**
 * Returns layout for symmetric knockout view, or null if this tournament
 * should use the linear grid fallback.
 */
export function getSymmetricKnockoutLayout(
  tournamentKey: string,
  bracket: PlayoffBracket,
): SymmetricKnockoutLayout | null {
  const map = slotMap(bracket);
  const finalSlot = finalSlotFromBracket(bracket);

  if (tournamentKey === 'world-cup-2026') {
    const r32Left = pick(
      Array.from({ length: 8 }, (_, i) => `r32-${i + 1}`),
      map,
    );
    const r32Right = pick(
      Array.from({ length: 8 }, (_, i) => `r32-${9 + i}`),
      map,
    );
    return {
      subtitle: bracket.knockoutSubtitle ?? WC_SUB,
      leftColumns: [
        { roundLabel: 'Round of 32', slots: r32Left },
        { roundLabel: 'Round of 16', slots: pick(['r16-1', 'r16-2', 'r16-3', 'r16-4'], map) },
        { roundLabel: 'Quarter-Final', slots: pick(['qf-1', 'qf-2'], map) },
        { roundLabel: 'Semi-Final', slots: pick(['sf-1'], map) },
      ],
      rightColumns: [
        { roundLabel: 'Semi-Final', slots: pick(['sf-2'], map) },
        { roundLabel: 'Quarter-Final', slots: pick(['qf-3', 'qf-4'], map) },
        { roundLabel: 'Round of 16', slots: pick(['r16-5', 'r16-6', 'r16-7', 'r16-8'], map) },
        { roundLabel: 'Round of 32', slots: r32Right },
      ],
      finalSlot,
    };
  }

  if (tournamentKey === 'euro-2024') {
    return {
      subtitle: bracket.knockoutSubtitle ?? EURO_SUB,
      leftColumns: [
        { roundLabel: 'Round of 16', slots: pick(['r16-1', 'r16-2', 'r16-3', 'r16-4'], map) },
        { roundLabel: 'Quarter-Final', slots: pick(['qf-1', 'qf-2'], map) },
        { roundLabel: 'Semi-Final', slots: pick(['sf-1'], map) },
      ],
      rightColumns: [
        { roundLabel: 'Semi-Final', slots: pick(['sf-2'], map) },
        { roundLabel: 'Quarter-Final', slots: pick(['qf-3', 'qf-4'], map) },
        { roundLabel: 'Round of 16', slots: pick(['r16-5', 'r16-6', 'r16-7', 'r16-8'], map) },
      ],
      finalSlot,
    };
  }

  return null;
}
