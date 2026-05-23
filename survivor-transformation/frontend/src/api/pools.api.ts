import { apiClient } from './client';

export interface OpenPool {
  id: string;
  name: string;
  status: string;
  participants: number;
  /** Approved participants in the pool. */
  approvedParticipants: number;
  /** Tournament key (e.g. 'euro-2024', 'world-cup-2026') for active tournament context. */
  tournamentKey?: string;
}

/** Raw shape from backend (may use _id) */
interface RawPool {
  _id?: string;
  id?: string;
  name?: string;
  status?: string;
  participants?: number;
  approvedParticipants?: number;
  tournamentKey?: string;
}

function normalizePool(p: RawPool): OpenPool {
  return {
    id: p.id ?? (p._id != null ? String(p._id) : ''),
    name: p.name ?? '',
    status: p.status ?? 'open',
    participants: Number(p.participants) || 0,
    approvedParticipants: Number(p.approvedParticipants) || 0,
    tournamentKey: p.tournamentKey ?? undefined,
  };
}

export async function getOpenPools(): Promise<OpenPool[]> {
  const { data } = await apiClient.get<RawPool[]>('/pools/survivor');
  const list = data ?? [];
  return list.map((p) => normalizePool(p));
}

export interface MyPoolMembership {
  poolId: string;
  poolName: string;
  status: string;
  eliminated: boolean;
  /** 'team_lost' = picked team lost; 'no_pick' = did not pick in the round */
  eliminatedReason?: 'team_lost' | 'no_pick';
}

export async function getMyPoolMemberships(): Promise<MyPoolMembership[]> {
  const { data } = await apiClient.get<MyPoolMembership[]>('/pools/survivor/me');
  return Array.isArray(data) ? data : [];
}

export async function joinPool(poolId: string): Promise<{ id: string; status: string }> {
  const { data } = await apiClient.post<{ _id?: string; id?: string; status: string }>(
    `/pools/${poolId}/join`,
    {}
  );
  const id = data?.id ?? (data && '_id' in data ? String((data as { _id: string })._id) : poolId);
  return { id: id ?? poolId, status: data?.status ?? 'pending' };
}

export type MyPoolStatus = 'none' | 'pending' | 'approved' | 'rejected' | 'winner';

export interface MyPoolStatusResponse {
  status: MyPoolStatus;
  name: string;
  tournamentKey?: string;
  poolStatus?: string;
  /** Count of approved participants who are not eliminated */
  playersRemaining?: number;
  /** Current user's eliminated status (only when approved) */
  eliminated?: boolean;
  /** Why the user was eliminated: 'team_lost' = picked team lost; 'no_pick' = did not pick in the round */
  eliminatedReason?: 'team_lost' | 'no_pick';
  /** Round number when the user was eliminated (if available) */
  eliminatedRound?: number;
  /** Team name the user had picked when eliminated (lost in that round) */
  eliminatedTeam?: string;
}

export async function getMyPoolStatus(poolId: string): Promise<MyPoolStatusResponse> {
  const { data } = await apiClient.get<MyPoolStatusResponse>(`/pools/${poolId}/me`);
  return data ?? { status: 'none' as const, name: '' };
}

/** Match shape from participant rounds API (same as admin). */
export interface ParticipantMatch {
  homeTeam: string;
  awayTeam: string;
  winnerTeam?: string | null;
  isDraw?: boolean;
  homeGoals?: number | null;
  awayGoals?: number | null;
}

/** Round shape from participant rounds API (same as admin). */
export interface ParticipantRound {
  _id?: string;
  poolId?: string;
  roundNumber: number;
  matches: ParticipantMatch[];
  isClosed: boolean;
  /** ISO 8601. Picks allowed only before this time. */
  pickDeadline?: string | null;
}

export async function getParticipantRounds(
  poolId: string
): Promise<ParticipantRound[]> {
  const { data } = await apiClient.get<ParticipantRound[]>(
    `/pools/${poolId}/survivor/rounds`
  );
  return Array.isArray(data) ? data : [];
}

/** Pick shape from GET /pools/:poolId/survivor/me */
export interface MyPick {
  _id?: string;
  round: number;
  team: string;
}

export async function getMyPicks(poolId: string): Promise<MyPick[]> {
  const { data } = await apiClient.get<MyPick[]>(
    `/pools/${poolId}/survivor/me`
  );
  return Array.isArray(data) ? data : [];
}

export async function submitPick(
  poolId: string,
  team: string
): Promise<{ message: string; round: number }> {
  const { data } = await apiClient.post<{ message: string; round: number }>(
    `/pools/${poolId}/survivor/pick`,
    { team }
  );
  return data ?? { message: '', round: 0 };
}

/** Pick distribution for a round */
export interface PickDistribution {
  team: string;
  count: number;
  percentage: number;
}

/** User pick with user information */
export interface UserPick {
  userId: string;
  username: string;
  team: string;
  createdAt: string;
}

/** Round statistics response */
export interface RoundStats {
  roundNumber: number;
  picksIn: number;
  stillDeciding: number;
  trendingPick: string | null;
  teamsPicked: number;
  pickDistribution: PickDistribution[];
  recentPicks: UserPick[];
  allPicks: UserPick[];
}

export async function getRoundStats(
  poolId: string,
  roundNumber: number
): Promise<RoundStats> {
  try {
    const { data } = await apiClient.get<RoundStats>(
      `/pools/${poolId}/survivor/stats/${roundNumber}`
    );

    return {
      roundNumber: data?.roundNumber ?? roundNumber,
      picksIn: data?.picksIn ?? 0,
      stillDeciding: data?.stillDeciding ?? 0,
      trendingPick: data?.trendingPick ?? null,
      teamsPicked: data?.teamsPicked ?? 0,
      pickDistribution: data?.pickDistribution ?? [],
      recentPicks: data?.recentPicks ?? [],
      allPicks: data?.allPicks ?? [],
    };
  } catch {
    return {
      roundNumber,
      picksIn: 0,
      stillDeciding: 0,
      trendingPick: null,
      teamsPicked: 0,
      pickDistribution: [],
      recentPicks: [],
      allPicks: [],
    };
  }
}

/** Last pick information */
export interface LastPick {
  round: number;
  team: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  roundsSurvived: number;
  lastPick: LastPick | null;
  isEliminated: boolean;
  eliminatedAt: string | null;
  isWinner: boolean;
  totalPicks: number;
}

/** Leaderboard response */
export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  totalPlayers: number;
  alivePlayers: number;
  /** Number of winners (entries with isWinner). */
  winnerCount: number;
}

/**
 * Get leaderboard data for a pool
 * @param poolId - Pool ID
 * @returns Leaderboard data with entries, total players, alive players, and winner count
 */
export async function getLeaderboard(
  poolId: string
): Promise<LeaderboardResponse> {
  try {
    const { data } = await apiClient.get<LeaderboardResponse>(
      `/pools/${poolId}/survivor/leaderboard`
    );

    // Backend returns object; support legacy array response for backward compatibility
    if (data && !Array.isArray(data) && 'entries' in data) {
      return {
        entries: data.entries ?? [],
        totalPlayers: data.totalPlayers ?? data.entries?.length ?? 0,
        alivePlayers: data.alivePlayers ?? 0,
        winnerCount: Number(data.winnerCount) || 0,
      };
    }

    const entries = Array.isArray(data) ? data : [];
    const totalPlayers = entries.length;
    const alivePlayers = entries.filter((e) => !e.isEliminated).length;
    return {
      entries,
      totalPlayers,
      alivePlayers,
      winnerCount: entries.filter((e) => e.isWinner).length,
    };
  } catch (error) {
    return {
      entries: [],
      totalPlayers: 0,
      alivePlayers: 0,
      winnerCount: 0,
    };
  }
}
