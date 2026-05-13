import { describe, expect, it } from 'vitest';
import type { ParticipantRound } from '~/api/pools.api';
import {
  buildLiveSymmetricKnockoutLayout,
  formatBracketScheduleShort,
} from './liveSymmetricLayout';
import type { KnockoutRoundSection } from './knockoutRounds';

function section(
  roundNumber: number,
  label: string,
  matches: { homeTeam: string; awayTeam: string }[],
  pickDeadline?: string,
): KnockoutRoundSection {
  const round: ParticipantRound = {
    roundNumber,
    matches,
    isClosed: false,
    pickDeadline: pickDeadline ?? null,
  };
  return { roundNumber, label, matches, round };
}

describe('formatBracketScheduleShort', () => {
  it('returns dash for empty', () => {
    expect(formatBracketScheduleShort(null)).toBe('—');
  });
});

describe('buildLiveSymmetricKnockoutLayout', () => {
  it('splits 16 matches into 8+8 for WC Round of 32', () => {
    const matches = Array.from({ length: 16 }, (_, i) => ({
      homeTeam: `H${i}`,
      awayTeam: `A${i}`,
    }));
    const sections = [
      section(4, 'Round of 32', matches),
    ];
    const layout = buildLiveSymmetricKnockoutLayout(sections, 'world-cup-2026')!;
    expect(layout.leftColumns[0].slots).toHaveLength(8);
    expect(layout.rightColumns[0].slots).toHaveLength(8);
    expect(layout.leftColumns[0].slots[0].homeTeam).toBe('H0');
    expect(layout.rightColumns[0].slots[0].homeTeam).toBe('H8');
  });

  it('isolates Final and uses first match for center', () => {
    const sections = [
      section(4, 'Round of 16', [
        { homeTeam: 'A', awayTeam: 'B' },
        { homeTeam: 'C', awayTeam: 'D' },
      ]),
      section(7, 'Final', [{ homeTeam: 'X', awayTeam: 'Y' }]),
    ];
    const layout = buildLiveSymmetricKnockoutLayout(sections, 'euro-2024')!;
    expect(layout.finalSlot.homeTeam).toBe('X');
    expect(layout.leftColumns).toHaveLength(1);
    expect(layout.rightColumns).toHaveLength(1);
    expect(layout.leftColumns[0].slots).toHaveLength(1);
    expect(layout.rightColumns[0].slots).toHaveLength(1);
  });

  it('excludes Third-place stage from wings (not shown in survivor bracket)', () => {
    const sections = [
      section(4, 'Round of 16', [{ homeTeam: 'A', awayTeam: 'B' }]),
      section(6, '3rd Place', [{ homeTeam: 'L1', awayTeam: 'L2' }]),
      section(7, 'Final', [{ homeTeam: 'X', awayTeam: 'Y' }]),
    ];
    const layout = buildLiveSymmetricKnockoutLayout(sections, 'euro-2024')!;
    expect(layout.finalSlot.homeTeam).toBe('X');
    expect(layout.leftColumns).toHaveLength(1);
    expect(layout.leftColumns[0].roundLabel).toBe('Round of 16');
  });
});
