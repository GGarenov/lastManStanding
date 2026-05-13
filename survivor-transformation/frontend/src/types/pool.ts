export type PoolStatus = 'draft' | 'open' | 'active' | 'completed';
export type ParticipantStatus = 'pending' | 'approved' | 'eliminated' | 'winner';
export type MatchResult = 'team_a' | 'team_b' | 'draw' | null;

export interface Pool {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: PoolStatus;
  currentRound: number;
  totalParticipants: number;
  activePlayers: number;
  createdAt: string;
  /** Tournament config key (e.g. 'euro-2024', 'world-cup-2026') for team flags and Add match dropdowns. */
  tournamentKey?: string;
  /** Participants waiting for approval (excluded from total if we ever show only approved). */
  pendingCount?: number;
  /** In-game eliminated (approved but knocked out). Rejected applicants are not counted here. */
  eliminatedCount?: number;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  status: ParticipantStatus;
  joinedAt: string;
  eliminatedRound?: number;
  picks: Pick[];
}

export interface Pick {
  roundId: string;
  teamId: string;
  teamName: string;
}

export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  result: MatchResult;
  scheduledAt?: string;
  /** Actual goals (when recorded). */
  homeGoals?: number | null;
  awayGoals?: number | null;
}

export interface Round {
  id: string;
  number: number;
  status: 'upcoming' | 'active' | 'closed';
  matches: Match[];
  deadline?: string;
}
