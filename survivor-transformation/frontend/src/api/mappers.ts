/**
 * Centralized mappers from backend (normalized) shapes to frontend types.
 * Backend responses use normalizeId/normalizeList, so _id is already mapped to id.
 */

import type {
  BackendPool,
  BackendParticipant,
  BackendRound,
  BackendMatch,
} from './types';
import type { Pool, Participant, Round, Match, MatchResult, ParticipantStatus } from '~/types/pool';

/** Normalized backend pool (after normalizeId): has id instead of _id */
export type NormalizedBackendPool = Omit<BackendPool, '_id'> & { id: string };

/** Normalized backend participant */
export type NormalizedBackendParticipant = Omit<BackendParticipant, '_id'> & { id: string };

/** Normalized backend round */
export type NormalizedBackendRound = Omit<BackendRound, '_id'> & { id: string };

/**
 * Map backend pool to frontend Pool.
 * Use placeholder 0 for currentRound, totalParticipants, activePlayers when not yet loaded.
 */
export function toPoolShape(b: NormalizedBackendPool): Pool {
  return {
    id: b.id,
    name: b.name,
    description: b.description,
    status: b.status === 'finished' ? 'completed' : b.status,
    startDate: b.startedAt,
    endDate: b.finishedAt,
    tournamentKey: b.tournamentKey,
    currentRound: 0,
    totalParticipants: 0,
    activePlayers: 0,
    createdAt: b.createdAt ?? '',
  };
}

/**
 * Map backend participant status (and eliminated flag) to frontend ParticipantStatus.
 */
export function toParticipantStatus(b: NormalizedBackendParticipant): ParticipantStatus {
  if (b.status === 'rejected' || b.eliminated) {
    return 'eliminated';
  }
  return b.status as ParticipantStatus;
}

/**
 * Map backend participant to frontend Participant.
 * userMap resolves userId -> { email, username } (e.g. from useUsersStore).
 */
export function toParticipantShape(
  b: NormalizedBackendParticipant,
  userMap: Record<string, { email?: string; username?: string }>
): Participant {
  const user = userMap[b.userId];
  const email = user?.email ?? b.userId;
  // Prefer username over email prefix for display name
  const name = (user?.username ?? (email.includes('@') ? email.split('@')[0] : email)) || 'User';
  return {
    id: b.id,
    name,
    email,
    status: toParticipantStatus(b),
    joinedAt: b.joinedAt ?? '',
    picks: [],
  };
}

/**
 * Map backend round to frontend Round.
 * Match id is derived from homeTeam-awayTeam; result from winnerTeam/isDraw.
 */
export function toRoundShape(b: NormalizedBackendRound): Round {
  const matches: Match[] = (b.matches ?? []).map((m: BackendMatch) => {
    const homeTeam = m.homeTeam;
    const awayTeam = m.awayTeam;
    let result: MatchResult = null;
    if (m.isDraw) result = 'draw';
    else if (m.winnerTeam === homeTeam) result = 'team_a';
    else if (m.winnerTeam === awayTeam) result = 'team_b';
    return {
      id: `${homeTeam}-${awayTeam}`,
      teamA: homeTeam,
      teamB: awayTeam,
      result,
      homeGoals: m.homeGoals ?? undefined,
      awayGoals: m.awayGoals ?? undefined,
    };
  });
  return {
    id: b.id,
    number: b.roundNumber,
    status: b.isClosed ? 'closed' : 'active',
    matches,
    deadline: b.pickDeadline ?? undefined,
  };
}
