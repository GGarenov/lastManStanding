import { apiClient } from './client';

export interface OpenPool {
  id: string;
  name: string;
  status: string;
  participants: number;
  /** Approved participants (for open pools: prize pool = approvedParticipants × prize per entry). */
  approvedParticipants: number;
  /** Prize pool in EUR (live for open pools, stored value for active/finished). */
  prizePoolEur: number;
  /** Entry fee in EUR per entry (default 50 when missing from API). */
  entryFeeEur: number;
  /** Rake in EUR per entry (default 10 when missing from API). */
  rakePerEntryEur: number;
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
  prizePoolEur?: number;
  entryFeeEur?: number;
  rakePerEntryEur?: number;
  tournamentKey?: string;
}

const DEFAULT_ENTRY_FEE_EUR = 50;
const DEFAULT_RAKE_PER_ENTRY_EUR = 10;

function normalizePool(p: RawPool): OpenPool {
  return {
    id: p.id ?? (p._id != null ? String(p._id) : ''),
    name: p.name ?? '',
    status: p.status ?? 'open',
    participants: Number(p.participants) || 0,
    approvedParticipants: Number(p.approvedParticipants) || 0,
    prizePoolEur: Number(p.prizePoolEur) || 0,
    entryFeeEur: Number(p.entryFeeEur) || DEFAULT_ENTRY_FEE_EUR,
    rakePerEntryEur: Number(p.rakePerEntryEur) || DEFAULT_RAKE_PER_ENTRY_EUR,
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
  /** Prize pool in EUR (live for open pools, stored value for active/finished) */
  prizePoolEur?: number;
  /** Entry fee in EUR per entry (default 50 when missing from API). */
  entryFeeEur?: number;
  /** Rake in EUR per entry (default 10 when missing from API). */
  rakePerEntryEur?: number;
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
  const base = data ?? { status: 'none' as const, name: '' };
  return {
    ...base,
    entryFeeEur: Number(base.entryFeeEur) || DEFAULT_ENTRY_FEE_EUR,
    rakePerEntryEur: Number(base.rakePerEntryEur) || DEFAULT_RAKE_PER_ENTRY_EUR,
  };
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
  /** Null/omitted when picks are hidden for the viewer */
  team?: string | null;
  count: number;
  percentage: number;
}

/** User pick with user information */
export interface UserPick {
  userId: string;
  username: string;
  /** Null when picks are hidden for the viewer */
  team: string | null;
  createdAt: string; // ISO date string
}

/** Round statistics response */
export interface RoundStats {
  roundNumber: number;
  pickDeadline?: string | null;
  pickDeadlinePassed: boolean;
  picksIn: number;
  stillDeciding: number;
  trendingPick: string | null;
  teamsPicked: number;
  pickDistribution: PickDistribution[];
  recentPicks: UserPick[];
  allPicks: UserPick[];
  /** True when round is closed or when the pick deadline has passed */
  picksRevealed: boolean;
}

/**
 * Get statistics for a specific round
 * @param poolId - Pool ID
 * @param roundNumber - Round number
 * @returns Round statistics
 */
export async function getRoundStats(
  poolId: string,
  roundNumber: number
): Promise<RoundStats> {
  try {
    const { data } = await apiClient.get<RoundStats>(
      `/pools/${poolId}/survivor/stats/${roundNumber}`
    );
    
    // Return data with defaults for missing fields
    return {
      roundNumber: data?.roundNumber ?? roundNumber,
      pickDeadline: data?.pickDeadline ?? null,
      pickDeadlinePassed: data?.pickDeadlinePassed ?? false,
      picksIn: data?.picksIn ?? 0,
      stillDeciding: data?.stillDeciding ?? 0,
      trendingPick: data?.trendingPick ?? null,
      teamsPicked: data?.teamsPicked ?? 0,
      pickDistribution: data?.pickDistribution ?? [],
      recentPicks: data?.recentPicks ?? [],
      allPicks: data?.allPicks ?? [],
      picksRevealed: data?.picksRevealed ?? false,
    };
  } catch (error) {
    // Return default values on error
    return {
      roundNumber,
      pickDeadline: null,
      pickDeadlinePassed: false,
      picksIn: 0,
      stillDeciding: 0,
      trendingPick: null,
      teamsPicked: 0,
      pickDistribution: [],
      recentPicks: [],
      allPicks: [],
      picksRevealed: false,
    };
  }
}

/** Last pick information */
export interface LastPick {
  round: number;
  team: string;
  createdAt: string; // ISO date string
}

/** Leaderboard entry */
export interface LeaderboardEntry {
  userId: string;
  username: string;
  roundsSurvived: number;
  lastPick: LastPick | null;
  isEliminated: boolean;
  eliminatedAt: string | null; // ISO date string
  isWinner: boolean;
  totalPicks: number;
}

/** Leaderboard response */
export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  totalPlayers: number;
  alivePlayers: number;
  /** Prize pool in EUR (from pool, set at start). */
  prizePoolEur: number;
  /** Number of winners (entries with isWinner). */
  winnerCount: number;
}

/**
 * Get leaderboard data for a pool
 * @param poolId - Pool ID
 * @returns Leaderboard data with entries, total players, alive players, prize pool, and winner count
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
        prizePoolEur: Number(data.prizePoolEur) || 0,
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
      prizePoolEur: 0,
      winnerCount: entries.filter((e) => e.isWinner).length,
    };
  } catch (error) {
    return {
      entries: [],
      totalPlayers: 0,
      alivePlayers: 0,
      prizePoolEur: 0,
      winnerCount: 0,
    };
  }
}
