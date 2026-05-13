import type { ParticipantMatch, ParticipantRound } from '~/api/pools.api';
import { isGroupStageRound } from '~/config/tournaments';
import type { GroupStandings, StandingRow } from '../standings.types';
import type { GroupDefinition } from './groupDefinitions';

function normalizeTeam(name: string): string {
  return name.trim().toLowerCase();
}

/** True when both sides have numeric scores (0–0 is a played draw). */
export function isPlayedGroupMatch(m: ParticipantMatch): boolean {
  return (
    typeof m.homeGoals === 'number' &&
    typeof m.awayGoals === 'number' &&
    !Number.isNaN(m.homeGoals) &&
    !Number.isNaN(m.awayGoals)
  );
}

interface SlotAcc {
  displayName: string;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  form: ('W' | 'D' | 'L')[];
}

function emptySlot(displayName: string): SlotAcc {
  return {
    displayName,
    mp: 0,
    w: 0,
    d: 0,
    l: 0,
    gf: 0,
    ga: 0,
    form: [],
  };
}

function findSlotIndex(
  group: string,
  teamName: string,
  slotsByGroup: Map<string, SlotAcc[]>,
): number {
  const n = normalizeTeam(teamName);
  const slots = slotsByGroup.get(group);
  if (!slots) return -1;
  return slots.findIndex((s) => normalizeTeam(s.displayName) === n);
}

/**
 * True if any group-stage round has at least one match with recorded scores.
 */
export function hasAnyPlayedGroupMatch(
  rounds: ParticipantRound[],
  tournamentKey: string,
): boolean {
  for (const r of rounds) {
    if (!isGroupStageRound(tournamentKey, r.roundNumber)) continue;
    if (r.matches.some((m) => isPlayedGroupMatch(m))) return true;
  }
  return false;
}

/**
 * Build live group tables from pool rounds (group-stage only) + static group definitions.
 */
export function computeGroupStandingsFromRounds(
  rounds: ParticipantRound[],
  tournamentKey: string,
  groupDefinitions: GroupDefinition[],
): GroupStandings[] {
  const slotsByGroup = new Map<string, SlotAcc[]>();
  for (const g of groupDefinitions) {
    slotsByGroup.set(
      g.group,
      g.teams.map((name) => emptySlot(name)),
    );
  }

  const sortedRounds = [...rounds].sort(
    (a, b) => a.roundNumber - b.roundNumber,
  );

  for (const round of sortedRounds) {
    if (!isGroupStageRound(tournamentKey, round.roundNumber)) continue;
    for (const m of round.matches) {
      if (!isPlayedGroupMatch(m)) continue;

      const home = m.homeTeam.trim();
      const away = m.awayTeam.trim();
      const hg = m.homeGoals as number;
      const ag = m.awayGoals as number;

      let homeGroup: string | null = null;
      let awayGroup: string | null = null;
      for (const g of groupDefinitions) {
        if (g.teams.some((t) => normalizeTeam(t) === normalizeTeam(home))) {
          homeGroup = g.group;
        }
        if (g.teams.some((t) => normalizeTeam(t) === normalizeTeam(away))) {
          awayGroup = g.group;
        }
      }

      if (
        homeGroup == null ||
        awayGroup == null ||
        homeGroup !== awayGroup
      ) {
        continue;
      }

      const idxH = findSlotIndex(homeGroup, home, slotsByGroup);
      const idxA = findSlotIndex(awayGroup, away, slotsByGroup);
      if (idxH < 0 || idxA < 0) continue;

      const slotH = slotsByGroup.get(homeGroup)![idxH];
      const slotA = slotsByGroup.get(awayGroup)![idxA];

      slotH.mp += 1;
      slotA.mp += 1;
      slotH.gf += hg;
      slotH.ga += ag;
      slotA.gf += ag;
      slotA.ga += hg;

      if (hg > ag) {
        slotH.w += 1;
        slotA.l += 1;
        slotH.form.push('W');
        slotA.form.push('L');
      } else if (hg < ag) {
        slotH.l += 1;
        slotA.w += 1;
        slotH.form.push('L');
        slotA.form.push('W');
      } else {
        slotH.d += 1;
        slotA.d += 1;
        slotH.form.push('D');
        slotA.form.push('D');
      }
    }
  }

  return groupDefinitions.map((gDef) => {
    const slots = slotsByGroup.get(gDef.group) ?? [];
    const rows: StandingRow[] = slots.map((slot) => {
      const gd = slot.gf - slot.ga;
      const pts = slot.w * 3 + slot.d;
      return {
        rank: 0,
        team: slot.displayName,
        mp: slot.mp,
        w: slot.w,
        d: slot.d,
        l: slot.l,
        gf: slot.gf,
        ga: slot.ga,
        gd,
        pts,
        form: slot.form.slice(-3),
      };
    });

    rows.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.team.localeCompare(b.team);
    });

    rows.forEach((row, i) => {
      row.rank = i + 1;
    });

    return { group: gDef.group, teams: rows };
  });
}
