import { describe, expect, it } from 'vitest';
import type { ParticipantRound } from '~/api/pools.api';
import {
  computeGroupStandingsFromRounds,
  hasAnyPlayedGroupMatch,
  isPlayedGroupMatch,
} from './computeGroupStandingsFromRounds';
import type { GroupDefinition } from './groupDefinitions';

const miniEuroGroups: GroupDefinition[] = [
  {
    group: 'A',
    teams: ['Germany', 'Scotland', 'Hungary', 'Switzerland'],
  },
  {
    group: 'B',
    teams: ['Spain', 'Italy'],
  },
];

describe('isPlayedGroupMatch', () => {
  it('returns false for null scores', () => {
    expect(
      isPlayedGroupMatch({
        homeTeam: 'A',
        awayTeam: 'B',
        homeGoals: null,
        awayGoals: null,
      }),
    ).toBe(false);
  });

  it('returns true for 0–0', () => {
    expect(
      isPlayedGroupMatch({
        homeTeam: 'A',
        awayTeam: 'B',
        homeGoals: 0,
        awayGoals: 0,
      }),
    ).toBe(true);
  });
});

describe('hasAnyPlayedGroupMatch', () => {
  it('is false when no group-stage played match', () => {
    const rounds: ParticipantRound[] = [
      {
        roundNumber: 1,
        matches: [
          { homeTeam: 'Germany', awayTeam: 'Scotland', homeGoals: null, awayGoals: null },
        ],
        isClosed: false,
      },
    ];
    expect(hasAnyPlayedGroupMatch(rounds, 'euro-2024')).toBe(false);
  });

  it('is true when euro round 1 has scores', () => {
    const rounds: ParticipantRound[] = [
      {
        roundNumber: 1,
        matches: [
          { homeTeam: 'Germany', awayTeam: 'Scotland', homeGoals: 5, awayGoals: 1 },
        ],
        isClosed: true,
      },
    ];
    expect(hasAnyPlayedGroupMatch(rounds, 'euro-2024')).toBe(true);
  });
});

describe('computeGroupStandingsFromRounds', () => {
  it('returns zeros when no played matches', () => {
    const rounds: ParticipantRound[] = [];
    const out = computeGroupStandingsFromRounds(
      rounds,
      'euro-2024',
      miniEuroGroups,
    );
    expect(out).toHaveLength(2);
    const groupA = out.find((g) => g.group === 'A')!;
    expect(groupA.teams.every((t) => t.mp === 0 && t.pts === 0)).toBe(true);
  });

  it('counts a home win and form', () => {
    const rounds: ParticipantRound[] = [
      {
        roundNumber: 1,
        matches: [
          { homeTeam: 'Germany', awayTeam: 'Scotland', homeGoals: 2, awayGoals: 1 },
        ],
        isClosed: true,
      },
    ];
    const out = computeGroupStandingsFromRounds(
      rounds,
      'euro-2024',
      miniEuroGroups,
    );
    const groupA = out.find((g) => g.group === 'A')!;
    const ger = groupA.teams.find((t) => t.team === 'Germany')!;
    const sco = groupA.teams.find((t) => t.team === 'Scotland')!;
    expect(ger).toMatchObject({ mp: 1, w: 1, pts: 3, form: ['W'] });
    expect(sco).toMatchObject({ mp: 1, l: 1, pts: 0, form: ['L'] });
    expect(ger.rank).toBe(1);
  });

  it('counts a draw', () => {
    const rounds: ParticipantRound[] = [
      {
        roundNumber: 1,
        matches: [
          { homeTeam: 'Spain', awayTeam: 'Italy', homeGoals: 1, awayGoals: 1 },
        ],
        isClosed: true,
      },
    ];
    const out = computeGroupStandingsFromRounds(
      rounds,
      'euro-2024',
      miniEuroGroups,
    );
    const groupB = out.find((g) => g.group === 'B')!;
    expect(groupB.teams.every((t) => t.mp === 1 && t.d === 1 && t.pts === 1)).toBe(
      true,
    );
  });

  it('ignores knockout round for euro-2024', () => {
    const rounds: ParticipantRound[] = [
      {
        roundNumber: 4,
        matches: [
          { homeTeam: 'Germany', awayTeam: 'Scotland', homeGoals: 3, awayGoals: 0 },
        ],
        isClosed: true,
      },
    ];
    const out = computeGroupStandingsFromRounds(
      rounds,
      'euro-2024',
      miniEuroGroups,
    );
    const groupA = out.find((g) => g.group === 'A')!;
    expect(groupA.teams.every((t) => t.mp === 0)).toBe(true);
  });

  it('orders form chronologically across rounds', () => {
    const rounds: ParticipantRound[] = [
      {
        roundNumber: 1,
        matches: [
          { homeTeam: 'Germany', awayTeam: 'Scotland', homeGoals: 1, awayGoals: 0 },
        ],
        isClosed: true,
      },
      {
        roundNumber: 2,
        matches: [
          { homeTeam: 'Germany', awayTeam: 'Hungary', homeGoals: 1, awayGoals: 1 },
        ],
        isClosed: true,
      },
      {
        roundNumber: 3,
        matches: [
          { homeTeam: 'Switzerland', awayTeam: 'Germany', homeGoals: 0, awayGoals: 2 },
        ],
        isClosed: true,
      },
    ];
    const out = computeGroupStandingsFromRounds(
      rounds,
      'euro-2024',
      miniEuroGroups,
    );
    const ger = out.find((g) => g.group === 'A')!.teams.find((t) => t.team === 'Germany')!;
    expect(ger.form).toEqual(['W', 'D', 'W']);
    expect(ger.mp).toBe(3);
    expect(ger.pts).toBe(7);
  });

  it('skips cross-group pairing', () => {
    const rounds: ParticipantRound[] = [
      {
        roundNumber: 1,
        matches: [
          { homeTeam: 'Germany', awayTeam: 'Spain', homeGoals: 1, awayGoals: 0 },
        ],
        isClosed: true,
      },
    ];
    const out = computeGroupStandingsFromRounds(
      rounds,
      'euro-2024',
      miniEuroGroups,
    );
    expect(out.find((g) => g.group === 'A')!.teams.every((t) => t.mp === 0)).toBe(
      true,
    );
    expect(out.find((g) => g.group === 'B')!.teams.every((t) => t.mp === 0)).toBe(
      true,
    );
  });
});
