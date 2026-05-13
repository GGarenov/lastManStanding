/**
 * EURO 2024 play-off bracket — frontend-only static data.
 * Backend has no play-off bracket; this is placeholder until backend/API supports it.
 * Team display names must match euro-2024.config.ts for TeamFlag resolution.
 * Use 'TBA' when team is not yet determined (no flag rendered).
 */

import type { PlayoffBracket } from './types';

/** EURO 2024 knockout bracket: Round of 16 → Quarter-finals → Semi-finals → Final. */
export const euro2024PlayoffBracket: PlayoffBracket = {
  knockoutSubtitle: 'Round of 16 → Final • Single elimination',
  rounds: [
    {
      label: 'Round of 16',
      slots: [
        { id: 'r16-1', homeTeam: 'TBA', awayTeam: 'TBA', feederSlotIds: undefined },
        { id: 'r16-2', homeTeam: 'TBA', awayTeam: 'TBA', feederSlotIds: undefined },
        { id: 'r16-3', homeTeam: 'TBA', awayTeam: 'TBA', feederSlotIds: undefined },
        { id: 'r16-4', homeTeam: 'TBA', awayTeam: 'TBA', feederSlotIds: undefined },
        { id: 'r16-5', homeTeam: 'TBA', awayTeam: 'TBA', feederSlotIds: undefined },
        { id: 'r16-6', homeTeam: 'TBA', awayTeam: 'TBA', feederSlotIds: undefined },
        { id: 'r16-7', homeTeam: 'TBA', awayTeam: 'TBA', feederSlotIds: undefined },
        { id: 'r16-8', homeTeam: 'TBA', awayTeam: 'TBA', feederSlotIds: undefined },
      ],
    },
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
      slots: [
        { id: 'final', homeTeam: 'TBA', awayTeam: 'TBA', feederSlotIds: ['sf-1', 'sf-2'] },
      ],
    },
  ],
};
