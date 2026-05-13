/**
 * FIFA World Cup 2026 play-off bracket — frontend-only static data.
 * 48-team tournament: 32 teams advance to the knockout stage (Round of 32 → … → Final).
 * Backend has no play-off bracket; this is placeholder until backend/API supports it.
 * Team display names must match world-cup-2026.config.ts for TeamFlag resolution.
 * Use 'TBA' when team is not yet determined (no flag rendered).
 */

import type { PlayoffBracket } from './types';

const r32Slots = Array.from({ length: 16 }, (_, i) => {
  const n = i + 1;
  return {
    id: `r32-${n}`,
    homeTeam: 'TBA' as const,
    awayTeam: 'TBA' as const,
    feederSlotIds: undefined as undefined,
  };
});

const r16Slots = Array.from({ length: 8 }, (_, i) => {
  const n = i + 1;
  const a = n * 2 - 1;
  const b = n * 2;
  return {
    id: `r16-${n}`,
    homeTeam: 'TBA' as const,
    awayTeam: 'TBA' as const,
    feederSlotIds: [`r32-${a}`, `r32-${b}`] as [string, string],
  };
});

/** World Cup 2026 knockout bracket: Round of 32 → Round of 16 → Quarter-finals → Semi-finals → Final. */
export const worldCup2026PlayoffBracket: PlayoffBracket = {
  knockoutSubtitle: 'Round of 32 → Final • Single elimination',
  rounds: [
    { label: 'Round of 32', slots: r32Slots },
    { label: 'Round of 16', slots: r16Slots },
    {
      label: 'Quarter-finals',
      slots: [
        { id: 'qf-1', homeTeam: 'TBA', awayTeam: 'TBA', feederSlotIds: ['r16-1', 'r16-2'] },
        { id: 'qf-2', homeTeam: 'TBA', awayTeam: 'TBA', feederSlotIds: ['r16-3', 'r16-4'] },
        { id: 'qf-3', homeTeam: 'TBA', awayTeam: 'TBA', feederSlotIds: ['r16-5', 'r16-6'] },
        { id: 'qf-4', homeTeam: 'TBA', awayTeam: 'TBA', feederSlotIds: ['r16-7', 'r16-8'] },
      ],
    },
    {
      label: 'Semi-finals',
      slots: [
        { id: 'sf-1', homeTeam: 'TBA', awayTeam: 'TBA', feederSlotIds: ['qf-1', 'qf-2'] },
        { id: 'sf-2', homeTeam: 'TBA', awayTeam: 'TBA', feederSlotIds: ['qf-3', 'qf-4'] },
      ],
    },
    {
      label: 'Final',
      slots: [{ id: 'final', homeTeam: 'TBA', awayTeam: 'TBA', feederSlotIds: ['sf-1', 'sf-2'] }],
    },
  ],
};
