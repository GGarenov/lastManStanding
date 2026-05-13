import type { TournamentConfig } from './types';

/**
 * EURO 2024 tournament config.
 * Display names must match backend match data (homeTeam, awayTeam, winnerTeam).
 * Code is ISO 3166-1 alpha-2 for react-world-flags.
 */
export const euro2024Config: TournamentConfig = {
  key: 'euro-2024',
  label: 'EURO 2024',
  teams: [
    { displayName: 'Germany', code: 'de', shortName: 'GER' }, // host
    { displayName: 'Scotland', code: 'gb', shortName: 'SCO' },
    { displayName: 'Hungary', code: 'hu', shortName: 'HUN' },
    { displayName: 'Switzerland', code: 'ch', shortName: 'SUI' },
    { displayName: 'Spain', code: 'es', shortName: 'ESP' },
    { displayName: 'Croatia', code: 'hr', shortName: 'CRO' },
    { displayName: 'Italy', code: 'it', shortName: 'ITA' },
    { displayName: 'Albania', code: 'al', shortName: 'ALB' },
    { displayName: 'Slovenia', code: 'si', shortName: 'SVN' },
    { displayName: 'Denmark', code: 'dk', shortName: 'DEN' },
    { displayName: 'Serbia', code: 'rs', shortName: 'SRB' },
    { displayName: 'England', code: 'gb', shortName: 'ENG' },
    { displayName: 'Poland', code: 'pl', shortName: 'POL' },
    { displayName: 'Netherlands', code: 'nl', shortName: 'NED' },
    { displayName: 'Austria', code: 'at', shortName: 'AUT' },
    { displayName: 'France', code: 'fr', shortName: 'FRA' },
    { displayName: 'Belgium', code: 'be', shortName: 'BEL' },
    { displayName: 'Slovakia', code: 'sk', shortName: 'SVK' },
    { displayName: 'Romania', code: 'ro', shortName: 'ROU' },
    { displayName: 'Ukraine', code: 'ua', shortName: 'UKR' },
    { displayName: 'Türkiye', code: 'tr', shortName: 'TUR' },
    { displayName: 'Georgia', code: 'ge', shortName: 'GEO' },
    { displayName: 'Portugal', code: 'pt', shortName: 'POR' },
    { displayName: 'Czechia', code: 'cz', shortName: 'CZE' },
  ],
  maxRounds: 7,
  rounds: [
    {
      roundNumber: 1,
      label: 'Group Stage (Matchday 1)',
      pickDeadline: '2024-06-14T21:00:00+02:00', // Opening match Germany vs Scotland, Munich
      // Official UEFA EURO 2024 schedule (June 14–19)
      matches: [
        { homeTeam: 'Germany', awayTeam: 'Scotland' },
        { homeTeam: 'Hungary', awayTeam: 'Switzerland' },
        { homeTeam: 'Spain', awayTeam: 'Croatia' },
        { homeTeam: 'Italy', awayTeam: 'Albania' },
        { homeTeam: 'Slovenia', awayTeam: 'Denmark' },
        { homeTeam: 'Serbia', awayTeam: 'England' },
        { homeTeam: 'Poland', awayTeam: 'Netherlands' },
        { homeTeam: 'Austria', awayTeam: 'France' },
        { homeTeam: 'Belgium', awayTeam: 'Slovakia' },
        { homeTeam: 'Romania', awayTeam: 'Ukraine' },
        { homeTeam: 'Türkiye', awayTeam: 'Georgia' },
        { homeTeam: 'Portugal', awayTeam: 'Czechia' },
      ],
    },
    {
      roundNumber: 2,
      label: 'Group Stage (Matchday 2)',
      pickDeadline: '2024-06-19T18:00:00+02:00', // First match of matchday 2
      // Official UEFA EURO 2024 schedule (June 19–25)
      matches: [
        { homeTeam: 'Hungary', awayTeam: 'Germany' },
        { homeTeam: 'Scotland', awayTeam: 'Switzerland' },
        { homeTeam: 'Croatia', awayTeam: 'Albania' },
        { homeTeam: 'Spain', awayTeam: 'Italy' },
        { homeTeam: 'Denmark', awayTeam: 'England' },
        { homeTeam: 'Slovenia', awayTeam: 'Serbia' },
        { homeTeam: 'Poland', awayTeam: 'Austria' },
        { homeTeam: 'Netherlands', awayTeam: 'France' },
        { homeTeam: 'Slovakia', awayTeam: 'Ukraine' },
        { homeTeam: 'Belgium', awayTeam: 'Romania' },
        { homeTeam: 'Türkiye', awayTeam: 'Portugal' },
        { homeTeam: 'Georgia', awayTeam: 'Czechia' },
      ],
    },
    {
      roundNumber: 3,
      label: 'Group Stage (Matchday 3)',
      pickDeadline: '2024-06-23T18:00:00+02:00', // First match of matchday 3
      // Official UEFA EURO 2024 schedule (June 23–26)
      matches: [
        { homeTeam: 'Switzerland', awayTeam: 'Germany' },
        { homeTeam: 'Scotland', awayTeam: 'Hungary' },
        { homeTeam: 'Croatia', awayTeam: 'Italy' },
        { homeTeam: 'Albania', awayTeam: 'Spain' },
        { homeTeam: 'England', awayTeam: 'Slovenia' },
        { homeTeam: 'Denmark', awayTeam: 'Serbia' },
        { homeTeam: 'Netherlands', awayTeam: 'Austria' },
        { homeTeam: 'France', awayTeam: 'Poland' },
        { homeTeam: 'Ukraine', awayTeam: 'Belgium' },
        { homeTeam: 'Slovakia', awayTeam: 'Romania' },
        { homeTeam: 'Georgia', awayTeam: 'Portugal' },
        { homeTeam: 'Czechia', awayTeam: 'Türkiye' },
      ],
    },
    { roundNumber: 4, label: 'Round of 16', pickDeadline: '2024-06-29T18:00:00+02:00', matches: [] },
    { roundNumber: 5, label: 'Quarter-finals', pickDeadline: '2024-07-05T18:00:00+02:00', matches: [] },
    { roundNumber: 6, label: 'Semi-finals', pickDeadline: '2024-07-09T21:00:00+02:00', matches: [] },
    { roundNumber: 7, label: 'Final', pickDeadline: '2024-07-14T21:00:00+02:00', matches: [] },
  ],
};
