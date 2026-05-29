/**
 * API response types aligned with NestJS backend.
 * Backend returns MongoDB documents with _id; use normalizeId() to get id.
 */

export type BackendPoolStatus = 'open' | 'active' | 'finished';
export type BackendParticipantStatus = 'pending' | 'approved' | 'rejected' | 'winner';

export interface BackendPool {
  _id: string;
  name: string;
  description?: string;
  status: BackendPoolStatus;
  createdBy: string;
  startedAt?: string;
  finishedAt?: string;
  tournamentKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendParticipant {
  _id: string;
  poolId: string;
  userId: string;
  status: BackendParticipantStatus;
  joinedAt?: string;
  approvedAt?: string;
  eliminated?: boolean;
  eliminatedAt?: string;
  winnerAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendMatch {
  homeTeam: string;
  awayTeam: string;
  winnerTeam?: string | null;
  isDraw?: boolean;
  homeGoals?: number | null;
  awayGoals?: number | null;
}

export interface BackendRound {
  _id: string;
  poolId: string;
  roundNumber: number;
  matches: BackendMatch[];
  isClosed: boolean;
  /** ISO 8601. Picks allowed only before this time. */
  pickDeadline?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
  balance?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    role?: string;
  };
  token: string;
}
