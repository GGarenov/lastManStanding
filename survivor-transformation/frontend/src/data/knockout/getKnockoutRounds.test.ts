import { describe, expect, it } from 'vitest';
import type { ParticipantRound } from '~/api/pools.api';
import { getKnockoutRounds, getKnockoutRoundSections } from './knockoutRounds';

describe('getKnockoutRounds', () => {
  it('returns empty for missing tournament key', () => {
    const rounds: ParticipantRound[] = [
      { roundNumber: 4, matches: [], isClosed: false },
    ];
    expect(getKnockoutRounds(rounds, null)).toEqual([]);
    expect(getKnockoutRounds(rounds, undefined)).toEqual([]);
    expect(getKnockoutRounds(rounds, '')).toEqual([]);
  });

  it('excludes euro-2024 group rounds', () => {
    const rounds: ParticipantRound[] = [
      { roundNumber: 1, matches: [], isClosed: false },
      { roundNumber: 2, matches: [], isClosed: false },
      { roundNumber: 3, matches: [], isClosed: false },
    ];
    expect(getKnockoutRounds(rounds, 'euro-2024')).toEqual([]);
  });

  it('includes euro-2024 knockout rounds only', () => {
    const r4: ParticipantRound = {
      roundNumber: 4,
      matches: [{ homeTeam: 'A', awayTeam: 'B' }],
      isClosed: false,
    };
    const r7: ParticipantRound = {
      roundNumber: 7,
      matches: [],
      isClosed: false,
    };
    const rounds: ParticipantRound[] = [
      { roundNumber: 1, matches: [], isClosed: false },
      r4,
      r7,
    ];
    expect(getKnockoutPeriodNumbers(rounds, 'euro-2024')).toEqual([4, 7]);
  });

  it('sorts by roundNumber', () => {
    const rounds: ParticipantRound[] = [
      { roundNumber: 7, matches: [], isClosed: false },
      { roundNumber: 5, matches: [], isClosed: false },
      { roundNumber: 4, matches: [], isClosed: false },
    ];
    const k = getKnockoutRounds(rounds, 'euro-2024');
    expect(k.map((r) => r.roundNumber)).toEqual([4, 5, 7]);
  });

  it('drops rounds not in tournament config', () => {
    const rounds: ParticipantRound[] = [
      { roundNumber: 99, matches: [], isClosed: false },
    ];
    expect(getKnockoutRounds(rounds, 'euro-2024')).toEqual([]);
  });

  it('world-cup-2026 includes round 4+ knockout shells', () => {
    const rounds: ParticipantRound[] = [
      { roundNumber: 3, matches: [], isClosed: false },
      { roundNumber: 4, matches: [], isClosed: false },
    ];
    expect(getKnockoutPeriodNumbers(rounds, 'world-cup-2026')).toEqual([4]);
  });
});

function getKnockoutPeriodNumbers(
  rounds: ParticipantRound[],
  key: string,
): number[] {
  return getKnockoutRounds(rounds, key).map((r) => r.roundNumber);
}

describe('getKnockoutRoundSections', () => {
  it('maps config labels for euro-2024', () => {
    const rounds: ParticipantRound[] = [
      { roundNumber: 4, matches: [], isClosed: false },
      { roundNumber: 5, matches: [], isClosed: false },
    ];
    const sections = getKnockoutRoundSections(rounds, 'euro-2024');
    expect(sections.map((s) => s.label)).toEqual([
      'Round of 16',
      'Quarter-finals',
    ]);
    expect(sections[0].roundNumber).toBe(4);
  });

  it('returns empty sections when no tournament key', () => {
    expect(
      getKnockoutRoundSections(
        [{ roundNumber: 4, matches: [], isClosed: false }],
        null,
      ),
    ).toEqual([]);
  });
});
