/**
 * EURO 2024 group standings — frontend-only static/mock data.
 * Team display names must match euro-2024.config.ts for TeamFlag resolution.
 * Backend has no groups/standings; this is placeholder until backend supports it.
 */

import type { GroupStandings } from '../standings.types';

/** EURO 2024 groups A–F with placeholder MP, W, D, L, G, GD, PTS, FORM. */
export const euro2024Standings: GroupStandings[] = [
  {
    group: 'A',
    teams: [
      { rank: 1, team: 'Germany', mp: 3, w: 2, d: 1, l: 0, gf: 7, ga: 2, gd: 5, pts: 7, form: ['W', 'D', 'W'] },
      { rank: 2, team: 'Switzerland', mp: 3, w: 1, d: 2, l: 0, gf: 4, ga: 2, gd: 2, pts: 5, form: ['D', 'W', 'D'] },
      { rank: 3, team: 'Hungary', mp: 3, w: 1, d: 0, l: 2, gf: 2, ga: 5, gd: -3, pts: 3, form: ['L', 'W', 'L'] },
      { rank: 4, team: 'Scotland', mp: 3, w: 0, d: 1, l: 2, gf: 2, ga: 6, gd: -4, pts: 1, form: ['L', 'D', 'L'] },
    ],
  },
  {
    group: 'B',
    teams: [
      { rank: 1, team: 'Spain', mp: 3, w: 3, d: 0, l: 0, gf: 5, ga: 0, gd: 5, pts: 9, form: ['W', 'W', 'W'] },
      { rank: 2, team: 'Italy', mp: 3, w: 1, d: 1, l: 1, gf: 3, ga: 3, gd: 0, pts: 4, form: ['W', 'L', 'D'] },
      { rank: 3, team: 'Croatia', mp: 3, w: 0, d: 2, l: 1, gf: 3, ga: 4, gd: -1, pts: 2, form: ['L', 'D', 'D'] },
      { rank: 4, team: 'Albania', mp: 3, w: 0, d: 1, l: 2, gf: 3, ga: 7, gd: -4, pts: 1, form: ['L', 'D', 'L'] },
    ],
  },
  {
    group: 'C',
    teams: [
      { rank: 1, team: 'England', mp: 3, w: 1, d: 2, l: 0, gf: 2, ga: 1, gd: 1, pts: 5, form: ['W', 'D', 'D'] },
      { rank: 2, team: 'Denmark', mp: 3, w: 0, d: 3, l: 0, gf: 2, ga: 2, gd: 0, pts: 3, form: ['D', 'D', 'D'] },
      { rank: 3, team: 'Slovenia', mp: 3, w: 0, d: 3, l: 0, gf: 2, ga: 2, gd: 0, pts: 3, form: ['D', 'D', 'D'] },
      { rank: 4, team: 'Serbia', mp: 3, w: 0, d: 2, l: 1, gf: 1, ga: 2, gd: -1, pts: 2, form: ['L', 'D', 'D'] },
    ],
  },
  {
    group: 'D',
    teams: [
      { rank: 1, team: 'Austria', mp: 3, w: 2, d: 0, l: 1, gf: 6, ga: 4, gd: 2, pts: 6, form: ['L', 'W', 'W'] },
      { rank: 2, team: 'France', mp: 3, w: 1, d: 2, l: 0, gf: 2, ga: 1, gd: 1, pts: 5, form: ['W', 'D', 'D'] },
      { rank: 3, team: 'Netherlands', mp: 3, w: 1, d: 1, l: 1, gf: 4, ga: 4, gd: 0, pts: 4, form: ['W', 'L', 'D'] },
      { rank: 4, team: 'Poland', mp: 3, w: 0, d: 1, l: 2, gf: 3, ga: 6, gd: -3, pts: 1, form: ['L', 'D', 'L'] },
    ],
  },
  {
    group: 'E',
    teams: [
      { rank: 1, team: 'Romania', mp: 3, w: 1, d: 2, l: 0, gf: 4, ga: 3, gd: 1, pts: 5, form: ['W', 'D', 'D'] },
      { rank: 2, team: 'Belgium', mp: 3, w: 1, d: 2, l: 0, gf: 2, ga: 1, gd: 1, pts: 5, form: ['W', 'D', 'D'] },
      { rank: 3, team: 'Slovakia', mp: 3, w: 1, d: 1, l: 1, gf: 3, ga: 3, gd: 0, pts: 4, form: ['W', 'L', 'D'] },
      { rank: 4, team: 'Ukraine', mp: 3, w: 0, d: 1, l: 2, gf: 2, ga: 4, gd: -2, pts: 1, form: ['L', 'D', 'L'] },
    ],
  },
  {
    group: 'F',
    teams: [
      { rank: 1, team: 'Portugal', mp: 3, w: 2, d: 0, l: 1, gf: 5, ga: 2, gd: 3, pts: 6, form: ['W', 'W', 'L'] },
      { rank: 2, team: 'Türkiye', mp: 3, w: 2, d: 0, l: 1, gf: 5, ga: 3, gd: 2, pts: 6, form: ['W', 'L', 'W'] },
      { rank: 3, team: 'Georgia', mp: 3, w: 1, d: 0, l: 2, gf: 4, ga: 5, gd: -1, pts: 3, form: ['L', 'W', 'L'] },
      { rank: 4, team: 'Czechia', mp: 3, w: 0, d: 1, l: 2, gf: 3, ga: 7, gd: -4, pts: 1, form: ['D', 'L', 'L'] },
    ],
  },
];
