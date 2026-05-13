import { Injectable, Inject } from '@nestjs/common';
import { RoundService } from '../round/round.service';
import { ParticipantService } from '../participant/participant.service';
import { Model } from 'mongoose';
import { PICKS_MODEL } from '../pick/pick.providers';
import { POOLS_MODEL } from '../pool/pool.providers';

@Injectable()
export class SurvivorService {
  constructor(
    private readonly roundService: RoundService,
    private readonly participantService: ParticipantService,

    @Inject(PICKS_MODEL)
    private readonly pickModel: Model<any>,

    @Inject(POOLS_MODEL)
    private readonly poolModel: Model<any>,
  ) {}

  /** ADMIN ACTION */
  async recordRoundResults(poolId: string, dto: any) {
    // 0️⃣ Alive BEFORE round
    const aliveBefore =
      await this.participantService.getAliveParticipants(poolId);

    // 1️⃣ Set results
    const round = await this.roundService.setRoundResults(poolId, dto);

    // 2️⃣ Close round
    await this.roundService.closeRound(round._id.toString());

    // 3️⃣ Resolve survivor logic
    await this.resolveRound(poolId, round.roundNumber, round.matches);

    // 4️⃣ Eliminate players with no valid pick (used all teams playing)
    await this.eliminatePlayersWithNoValidPick(
      poolId,
      round.roundNumber,
      round.matches,
    );

    // 5️⃣ Check pool end (pass round number for "everyone eliminated this round" winner rule)
    await this.checkPoolEnd(poolId, aliveBefore, round.roundNumber);

    return { message: `Round ${round.roundNumber} resolved` };
  }

  /** CORE GAME LOGIC */
  private async resolveRound(
    poolId: string,
    roundNumber: number,
    matches: any[],
  ) {
    const winningTeams = matches
      .filter((m) => m.winnerTeam)
      .map((m) => m.winnerTeam);

    const picks = await this.pickModel.find({
      poolId,
      round: roundNumber,
      eliminated: { $ne: true },
    });

    for (const pick of picks) {
      if (!winningTeams.includes(pick.team)) {
        pick.eliminated = true;
        await pick.save();

        await this.participantService.eliminate(
          poolId,
          pick.userId,
          'team_lost',
        );
      }
    }
  }

  /**
   * Eliminates alive participants who have no pick for this round.
   * Each player MUST pick a team every round; if they don't, they are eliminated when results are recorded.
   */
  private async eliminatePlayersWithNoValidPick(
    poolId: string,
    roundNumber: number,
    _matches: any[],
  ): Promise<void> {
    const aliveParticipants =
      await this.participantService.getAliveParticipants(poolId);

    for (const participant of aliveParticipants) {
      const userId = participant.userId?.toString?.() ?? participant.userId;

      const hasPick = await this.pickModel.exists({
        poolId,
        userId,
        round: roundNumber,
      });

      if (!hasPick) {
        await this.participantService.eliminate(poolId, userId, 'no_pick');
      }
    }
  }

  /** GAME END LOGIC */
  private async checkPoolEnd(
    poolId: string,
    aliveBefore: any[],
    roundNumber: number,
  ) {
    const aliveAfter =
      await this.participantService.getAliveParticipants(poolId);

    // Everyone eliminated this round: apply correct winner rule (Scenario 1 vs 2)
    if (aliveAfter.length === 0 && aliveBefore.length > 0) {
      const userIdsWithPick = await this.pickModel.distinct('userId', {
        poolId,
        round: roundNumber,
      });
      const winnerIds = userIdsWithPick.map(
        (id: any) => id?.toString?.() ?? id,
      );

      if (winnerIds.length > 0) {
        // Scenario 1: some had a pick this round → only those are winners (even if pick lost)
        await this.participantService.markWinners(poolId, winnerIds);
      } else {
        // Scenario 2: nobody had a pick (all had no valid team) → all last survivors are winners
        await this.participantService.markWinners(
          poolId,
          aliveBefore.map((p) => p.userId?.toString?.() ?? p.userId),
        );
      }
      await this.markPoolFinished(poolId);
      return;
    }

    // 🏆 един победител
    if (aliveAfter.length === 1) {
      await this.participantService.markWinners(
        poolId,
        aliveAfter.map((p) => p.userId?.toString?.() ?? p.userId),
      );
      await this.markPoolFinished(poolId);
    }
  }

  private async markPoolFinished(poolId: string): Promise<void> {
    await this.poolModel.findByIdAndUpdate(poolId, {
      status: 'finished',
      finishedAt: new Date(),
    });
  }
}
