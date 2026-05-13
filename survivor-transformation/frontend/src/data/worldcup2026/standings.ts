/**
 * World Cup 2026 group standings — frontend-only static/mock data.
 * 12 groups (A–L), 4 teams each. Composition matches final draw / group lists; team names align with
 * world-cup-2026.config.ts (Türkiye for Turkey; DR Congo for Congo DR).
 * Default rows: all stats zero, no form yet (empty array).
 */

import type { GroupStandings, StandingRow } from '../standings.types';

function zeroRow(rank: number, team: string): StandingRow {
  return {
    rank,
    team,
    mp: 0,
    w: 0,
    d: 0,
    l: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    pts: 0,
    form: [],
  };
}

/** World Cup 2026 groups A–L — initial empty table before any results. */
export const worldCup2026Standings: GroupStandings[] = [
  {
    group: 'A',
    teams: [
      zeroRow(1, 'Czech Republic'),
      zeroRow(2, 'Mexico'),
      zeroRow(3, 'South Africa'),
      zeroRow(4, 'South Korea'),
    ],
  },
  {
    group: 'B',
    teams: [
      zeroRow(1, 'Bosnia and Herzegovina'),
      zeroRow(2, 'Canada'),
      zeroRow(3, 'Qatar'),
      zeroRow(4, 'Switzerland'),
    ],
  },
  {
    group: 'C',
    teams: [
      zeroRow(1, 'Brazil'),
      zeroRow(2, 'Haiti'),
      zeroRow(3, 'Morocco'),
      zeroRow(4, 'Scotland'),
    ],
  },
  {
    group: 'D',
    teams: [
      zeroRow(1, 'Australia'),
      zeroRow(2, 'Paraguay'),
      zeroRow(3, 'Türkiye'),
      zeroRow(4, 'United States'),
    ],
  },
  {
    group: 'E',
    teams: [
      zeroRow(1, 'Curaçao'),
      zeroRow(2, 'Ecuador'),
      zeroRow(3, 'Germany'),
      zeroRow(4, 'Ivory Coast'),
    ],
  },
  {
    group: 'F',
    teams: [
      zeroRow(1, 'Japan'),
      zeroRow(2, 'Netherlands'),
      zeroRow(3, 'Sweden'),
      zeroRow(4, 'Tunisia'),
    ],
  },
  {
    group: 'G',
    teams: [
      zeroRow(1, 'Belgium'),
      zeroRow(2, 'Egypt'),
      zeroRow(3, 'Iran'),
      zeroRow(4, 'New Zealand'),
    ],
  },
  {
    group: 'H',
    teams: [
      zeroRow(1, 'Cape Verde'),
      zeroRow(2, 'Saudi Arabia'),
      zeroRow(3, 'Spain'),
      zeroRow(4, 'Uruguay'),
    ],
  },
  {
    group: 'I',
    teams: [
      zeroRow(1, 'France'),
      zeroRow(2, 'Iraq'),
      zeroRow(3, 'Norway'),
      zeroRow(4, 'Senegal'),
    ],
  },
  {
    group: 'J',
    teams: [
      zeroRow(1, 'Algeria'),
      zeroRow(2, 'Argentina'),
      zeroRow(3, 'Austria'),
      zeroRow(4, 'Jordan'),
    ],
  },
  {
    group: 'K',
    teams: [
      zeroRow(1, 'Colombia'),
      zeroRow(2, 'DR Congo'),
      zeroRow(3, 'Portugal'),
      zeroRow(4, 'Uzbekistan'),
    ],
  },
  {
    group: 'L',
    teams: [
      zeroRow(1, 'Croatia'),
      zeroRow(2, 'England'),
      zeroRow(3, 'Ghana'),
      zeroRow(4, 'Panama'),
    ],
  },
];
