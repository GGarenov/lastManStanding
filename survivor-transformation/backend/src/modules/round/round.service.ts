import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Round } from './round.interface';
import { ROUNDS_MODEL } from './round.providers';

export interface MatchResultInput {
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
}

export interface SetRoundResultsPayload {
  roundNumber?: number;
  results: MatchResultInput[];
}

@Injectable()
export class RoundService {
  constructor(
    @Inject(ROUNDS_MODEL)
    private readonly roundModel: Model<Round>,
  ) {}

  async getAllRounds(poolId: string) {
    return this.roundModel.find({ poolId }).sort({ roundNumber: 1 }).lean();
  }

  async getActiveRound(poolId: string): Promise<Round> {
    const round = await this.roundModel.findOne({
      poolId,
      isClosed: false,
    });

    if (!round) {
      throw new BadRequestException('No active round');
    }

    return round;
  }

  async getRoundByNumber(poolId: string, roundNumber: number): Promise<Round> {
    const round = await this.roundModel.findOne({ poolId, roundNumber });

    if (!round) {
      throw new BadRequestException(`Round ${roundNumber} not found`);
    }

    return round;
  }

  async setRoundResults(
    poolId: string,
    dto: SetRoundResultsPayload,
  ): Promise<Round> {
    const round =
      dto.roundNumber != null
        ? await this.getRoundByNumber(poolId, dto.roundNumber)
        : await this.getActiveRound(poolId);

    if (round.isClosed) {
      throw new BadRequestException(
        `Round ${round.roundNumber} is already closed`,
      );
    }

    const resultMap = new Map<string, MatchResultInput>();
    for (const r of dto.results) {
      const key = `${r.homeTeam}-${r.awayTeam}`;
      resultMap.set(key, r);
    }

    for (const match of round.matches) {
      const key = `${match.homeTeam}-${match.awayTeam}`;
      const result = resultMap.get(key);
      if (!result) {
        throw new BadRequestException(
          `No result provided for match ${match.homeTeam} vs ${match.awayTeam}`,
        );
      }
      match.homeGoals = result.homeGoals;
      match.awayGoals = result.awayGoals;
      if (result.homeGoals > result.awayGoals) {
        match.winnerTeam = match.homeTeam;
        match.isDraw = false;
      } else if (result.awayGoals > result.homeGoals) {
        match.winnerTeam = match.awayTeam;
        match.isDraw = false;
      } else {
        match.winnerTeam = undefined;
        match.isDraw = true;
      }
    }

    return round.save();
  }

  async closeRound(roundId: string): Promise<void> {
    await this.roundModel.findByIdAndUpdate(roundId, {
      isClosed: true,
    });
  }
}
