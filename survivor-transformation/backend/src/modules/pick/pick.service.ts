import {
  Injectable,
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { PICKS_MODEL } from './pick.providers';
import { POOLS_MODEL } from '../pool/pool.providers';
import { POOL_PARTICIPANTS_MODEL } from '../participant/participant.providers';
import { USERS_MODEL } from '../users/users.providers';
import { Pick, PickTeamDto } from './pick.interface';
import { ParticipantService } from '../participant/participant.service';
import { RoundService } from '../round/round.service';

@Injectable()
export class PickService {
  constructor(
    @Inject(PICKS_MODEL)
    private readonly pickModel: Model<Pick>,
    @Inject(POOL_PARTICIPANTS_MODEL)
    private readonly participantModel: Model<any>,
    @Inject(USERS_MODEL)
    private readonly userModel: Model<any>,
    @Inject(POOLS_MODEL)
    private readonly poolModel: Model<any>,
    private readonly participantService: ParticipantService,
    private readonly roundService: RoundService,
  ) {}

  async pickTeam(poolId: string, userId: string, dto: PickTeamDto) {
    const { team } = dto;

    // 1️⃣ User must be approved & alive
    await this.participantService.ensureAlive(poolId, userId);

    // 2️⃣ Get active round
    const round = await this.roundService.getActiveRound(poolId);

    if (round.pickDeadline && new Date() >= round.pickDeadline) {
      throw new BadRequestException('Pick deadline has passed for this round');
    }

    // 3️⃣ Team must exist in this round
    const teamExists = round.matches.some(
      (m) => m.homeTeam === team || m.awayTeam === team,
    );

    if (!teamExists) {
      throw new BadRequestException('Отборът не участва в текущия рунд');
    }

    // 4️⃣ Create pick
    try {
      await this.pickModel.create({
        poolId,
        userId,
        team,
        round: round.roundNumber,
      });
    } catch (err: any) {
      if (err.code === 11000) {
        throw new BadRequestException(
          'Вече имате избор за този рунд или сте използвали този отбор',
        );
      }
      throw err;
    }

    return {
      message: `Успешно избрахте ${team}`,
      round: round.roundNumber,
    };
  }

  async getUserStatus(poolId: string, userId: string) {
    return this.pickModel.find({ poolId, userId }).sort({ round: 1 }).lean();
  }

  async getAllUsersStatus(poolId: string) {
    return this.pickModel.find({ poolId }).sort({ userId: 1, round: 1 }).lean();
  }

  /**
   * Returns all team names the user has already picked in this pool.
   * Used to detect "no teams left" scenario (user used all teams playing in current round).
   */
  async getTeamsUsedByUser(poolId: string, userId: string): Promise<string[]> {
    const picks = await this.pickModel
      .find({ poolId, userId })
      .select('team')
      .lean();
    return picks.map((p) => p.team);
  }

  /**
   * Get statistics for a specific round.
   * Team identities are hidden until the round is closed or the pick deadline has passed.
   */
  async getRoundStats(poolId: string, roundNumber: number, _userId: string) {
    let round;
    try {
      round = await this.roundService.getRoundByNumber(poolId, roundNumber);
    } catch {
      throw new NotFoundException(`Round ${roundNumber} not found`);
    }

    // Get all picks for this round
    const picks = await this.pickModel
      .find({ poolId, round: roundNumber })
      .sort({ createdAt: -1 })
      .lean();

    const pickDeadlinePassed =
      round.pickDeadline != null &&
      new Date() >= new Date(round.pickDeadline);
    const picksRevealed = round.isClosed || pickDeadlinePassed;

    // Get approved participants who are still in the pool (not eliminated).
    // Only they are expected to pick this round; eliminated users must not count as "still deciding".
    const activeParticipants = await this.participantModel
      .find({ poolId, status: 'approved', eliminated: { $ne: true } })
      .select('userId')
      .lean();

    const activeUserIds = new Set(
      activeParticipants.map((p) => p.userId?.toString() ?? p.userId),
    );

    // Get unique user IDs from picks
    const userIdsFromPicks = Array.from(
      new Set(picks.map((p) => p.userId?.toString() ?? p.userId)),
    );

    // Fetch user data for all users who made picks
    const users = await this.userModel
      .find({ _id: { $in: userIdsFromPicks } })
      .select('username email')
      .lean();

    // Create a map of userId -> user data
    const userMap = new Map<string, { username?: string; email?: string }>();
    for (const user of users) {
      const userId = user._id?.toString() ?? user._id;
      if (userId) {
        userMap.set(userId, {
          username: user.username,
          email: user.email,
        });
      }
    }

    // Get unique users who made picks
    const usersWithPicks = new Set(userIdsFromPicks);

    const picksIn = usersWithPicks.size;
    const stillDeciding = activeUserIds.size - picksIn;

    // Calculate pick distribution
    const teamCounts = new Map<string, number>();
    for (const pick of picks) {
      const team = pick.team;
      teamCounts.set(team, (teamCounts.get(team) || 0) + 1);
    }

    const totalPicks = picks.length;
    const pickDistribution = Array.from(teamCounts.entries())
      .map(([team, count]) => ({
        team,
        count,
        percentage: totalPicks > 0 ? Math.round((count / totalPicks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

    // Find trending pick (most picked team)
    const trendingPick =
      pickDistribution.length > 0 ? pickDistribution[0].team : null;

    const teamsPicked = teamCounts.size;

    // Format picks with user info
    const formatPick = (pick: any) => {
      const userId = pick.userId?.toString() ?? pick.userId;
      const user = userMap.get(userId);
      const username =
        user?.username ?? user?.email?.split('@')[0] ?? 'Unknown';
      return {
        userId,
        username,
        team: pick.team,
        createdAt: pick.createdAt,
      };
    };

    // Recent picks (last 10)
    const recentPicks = picks.slice(0, 10).map(formatPick);

    // All picks
    const allPicks = picks.map(formatPick);

    const baseStats = {
      roundNumber,
      pickDeadline: round.pickDeadline ?? null,
      pickDeadlinePassed,
      picksIn,
      stillDeciding: Math.max(0, stillDeciding), // Ensure non-negative
      trendingPick,
      teamsPicked,
      pickDistribution,
      recentPicks,
      allPicks,
      picksRevealed,
    };

    if (picksRevealed) {
      return baseStats;
    }

    return {
      ...baseStats,
      trendingPick: null,
      pickDistribution: [],
      recentPicks: recentPicks.map((pick) => ({ ...pick, team: null })),
      allPicks: allPicks.map((pick) => ({ ...pick, team: null })),
    };
  }

  /**
   * Get leaderboard data for a pool
   * Returns object with entries, totalPlayers, alivePlayers, prizePoolEur, winnerCount
   */
  async getLeaderboard(poolId: string) {
    const pool = await this.poolModel.findById(poolId).lean();
    const prizePoolEur = pool?.prizePoolEur ?? 0;

    // Get all approved and winner participants (so finished pools still show full leaderboard)
    const participants = await this.participantModel
      .find({ poolId, status: { $in: ['approved', 'winner'] } })
      .select('userId eliminated eliminatedAt status')
      .lean();

    if (participants.length === 0) {
      return {
        entries: [],
        totalPlayers: 0,
        alivePlayers: 0,
        prizePoolEur,
        winnerCount: 0,
      };
    }

    // Get all user IDs
    const userIds = participants.map((p) => p.userId?.toString() ?? p.userId);

    // Fetch user data for all participants
    const users = await this.userModel
      .find({ _id: { $in: userIds } })
      .select('username email')
      .lean();

    // Create a map of userId -> user data
    const userMap = new Map<string, { username?: string; email?: string }>();
    for (const user of users) {
      const userId = user._id?.toString() ?? user._id;
      if (userId) {
        userMap.set(userId, {
          username: user.username,
          email: user.email,
        });
      }
    }

    // Get all picks for all participants
    const allPicks = await this.pickModel
      .find({ poolId, userId: { $in: userIds } })
      .sort({ round: -1, createdAt: -1 })
      .lean();

    // Group picks by userId
    const picksByUser = new Map<string, typeof allPicks>();
    for (const pick of allPicks) {
      const userId = pick.userId?.toString() ?? pick.userId;
      if (userId) {
        if (!picksByUser.has(userId)) {
          picksByUser.set(userId, []);
        }
        picksByUser.get(userId)!.push(pick);
      }
    }

    // Build leaderboard entries
    const leaderboard = participants.map((participant) => {
      const userId = participant.userId?.toString() ?? participant.userId;
      const user = userMap.get(userId);
      const username =
        user?.username ?? user?.email?.split('@')[0] ?? 'Unknown';

      const userPicks = picksByUser.get(userId) || [];

      // Calculate roundsSurvived: count of non-eliminated picks
      const roundsSurvived = userPicks.filter((p) => !p.eliminated).length;

      // Get lastPick: most recent pick (by round number, then createdAt)
      const lastPick =
        userPicks.length > 0
          ? {
              round: userPicks[0].round,
              team: userPicks[0].team,
              createdAt: userPicks[0].createdAt,
            }
          : null;

      // Get participant data
      const isEliminated = !!participant.eliminated;
      const eliminatedAt = participant.eliminatedAt || null;
      const isWinner = participant.status === 'winner';
      const totalPicks = userPicks.length;

      return {
        userId,
        username,
        roundsSurvived,
        lastPick,
        isEliminated,
        eliminatedAt,
        isWinner,
        totalPicks,
      };
    });

    // Sort by:
    // 1. roundsSurvived DESC (most rounds survived first)
    // 2. totalPicks DESC (if same rounds, more picks = better)
    // 3. lastPick.createdAt ASC (if same, earlier last pick = better)
    leaderboard.sort((a, b) => {
      // Primary: roundsSurvived DESC
      if (a.roundsSurvived !== b.roundsSurvived) {
        return b.roundsSurvived - a.roundsSurvived;
      }

      // Secondary: totalPicks DESC
      if (a.totalPicks !== b.totalPicks) {
        return b.totalPicks - a.totalPicks;
      }

      // Tertiary: lastPick.createdAt ASC (earlier = better)
      const aTime = a.lastPick?.createdAt
        ? new Date(a.lastPick.createdAt).getTime()
        : Infinity;
      const bTime = b.lastPick?.createdAt
        ? new Date(b.lastPick.createdAt).getTime()
        : Infinity;
      return aTime - bTime;
    });

    const winnerCount = leaderboard.filter((e) => e.isWinner).length;
    const alivePlayers = leaderboard.filter((e) => !e.isEliminated).length;

    return {
      entries: leaderboard,
      totalPlayers: leaderboard.length,
      alivePlayers,
      prizePoolEur,
      winnerCount,
    };
  }
}
