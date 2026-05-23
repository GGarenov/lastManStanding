import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { PICKS_MODEL } from '../pick';
import { POOLS_MODEL } from '../pool';
import { ROUNDS_MODEL } from '../round';
import { POOL_PARTICIPANTS_MODEL } from '../participant';
import {
  Pick,
  Pool,
  PoolParticipant,
  Round,
} from '../survivor/survivor.interface';
import {
  AddRoundDto,
  ApproveParticipantDto,
  CreatePoolDto,
  UpdateParticipantDto,
  UpdatePoolDto,
  UpdateRoundDto,
} from './admin.interface';
import { SurvivorService } from '../survivor';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(
    @Inject(POOLS_MODEL)
    private readonly poolModel: Model<Pool>,

    @Inject(POOL_PARTICIPANTS_MODEL)
    private readonly participantModel: Model<PoolParticipant>,

    @Inject(ROUNDS_MODEL)
    private readonly roundModel: Model<Round>,

    @Inject(PICKS_MODEL)
    private readonly pickModel: Model<Pick>,

    private readonly survivorService: SurvivorService,
    private readonly usersService: UsersService,
  ) {}

  /** ---------------- POOL ---------------- */
  async createPool(dto: CreatePoolDto) {
    return this.poolModel.create({
      ...dto,
      status: 'open',
    });
  }

  /**
   * Starts a pool (open → active). All validations run before any DB write.
   * On validation failure the pool document is not modified (status stays `open`, no `startedAt`).
   * Requirements: ≥1 approved participant, ≥1 round, and at least one round has ≥1 match.
   */
  async startPool(poolId: string) {
    const pool = await this.poolModel.findById(poolId);
    if (!pool) throw new BadRequestException('Pool не съществува');

    if (pool.status !== 'open') {
      throw new BadRequestException('Pool already started or finished');
    }

    const participantsCount = await this.participantModel.countDocuments({
      poolId,
      status: 'approved',
    });
    const rounds = await this.roundModel.find({ poolId });
    const roundsCount = rounds.length;
    const hasRoundWithMatch = rounds.some(
      (r) => r.matches && r.matches.length >= 1,
    );

    if (participantsCount < 1) {
      throw new BadRequestException(
        'Cannot start pool without at least one approved participant.',
      );
    }
    if (roundsCount < 1) {
      throw new BadRequestException(
        'No rounds created yet. Create a round in the Rounds & Results tab.',
      );
    }
    if (!hasRoundWithMatch) {
      throw new BadRequestException(
        'No matches created yet. Add at least one match to a round in the Rounds & Results tab.',
      );
    }

    pool.status = 'active';
    pool.startedAt = new Date();
    await pool.save();
    return { message: 'Pool started successfully' };
  }

  async updatePool(poolId: string, dto: UpdatePoolDto) {
    const pool = await this.poolModel.findById(poolId);
    if (!pool) throw new BadRequestException('Pool не съществува');

    if (pool.status === 'finished')
      throw new BadRequestException('Finished pool cannot be edited');

    if (dto.status === 'active') {
      await this.startPool(poolId);
      const updated = await this.poolModel.findById(poolId);
      if (!updated) throw new BadRequestException('Pool не съществува');
      const { status, ...rest } = dto;
      if (Object.keys(rest).length > 0) {
        Object.assign(updated, rest);
        return updated.save();
      }
      return updated;
    }

    Object.assign(pool, dto);
    return pool.save();
  }

  async deletePool(poolId: string) {
    const pool = await this.poolModel.findById(poolId);
    if (!pool) throw new BadRequestException('Pool не съществува');

    await this.participantModel.deleteMany({ poolId });
    await this.roundModel.deleteMany({ poolId });
    await this.pickModel.deleteMany({ poolId });

    return this.poolModel.findByIdAndDelete(poolId);
  }

  async getPools() {
    return this.poolModel.find();
  }

  /** ---------------- PARTICIPANTS ---------------- */
  async approveParticipant(participantId: string, dto: ApproveParticipantDto) {
    const participant = await this.participantModel.findById(participantId);
    if (!participant) throw new BadRequestException('Участникът не съществува');

    if (participant.status !== 'pending')
      throw new BadRequestException('Участникът вече е обработен');

    participant.status = 'approved';
    participant.approvedAt = new Date();
    return participant.save();
  }

  async updateParticipant(participantId: string, dto: UpdateParticipantDto) {
    const participant = await this.participantModel.findById(participantId);
    if (!participant) throw new BadRequestException('Участникът не съществува');

    Object.assign(participant, dto);
    return participant.save();
  }

  async deleteParticipant(participantId: string) {
    const participant = await this.participantModel.findById(participantId);
    if (!participant) throw new BadRequestException('Участникът не съществува');

    await this.pickModel.deleteMany({
      userId: participant.userId,
      poolId: participant.poolId,
    });

    await participant.deleteOne();
    return { message: 'Участникът е изтрит успешно' };
  }

  async getParticipants(poolId: string) {
    return this.participantModel.find({ poolId });
  }

  /** ---------------- ROUND ---------------- */
  async getRounds(poolId: string) {
    return this.roundModel.find({ poolId }).sort({ roundNumber: 1 }).lean();
  }

  async addRound(poolId: string, dto: AddRoundDto) {
    const teamNames: string[] = [];
    for (const match of dto.matches) {
      teamNames.push(match.homeTeam, match.awayTeam);
    }
    const seen = new Set<string>();
    for (const name of teamNames) {
      if (seen.has(name)) {
        throw new BadRequestException('Duplicate teams are not allowed in the same round');
      }
      seen.add(name);
    }

    return this.roundModel.create({
      poolId,
      roundNumber: dto.roundNumber,
      matches: dto.matches,
      isClosed: false,
      ...(dto.pickDeadline != null && { pickDeadline: dto.pickDeadline }),
    });
  }

  async updateRound(poolId: string, roundNumber: number, dto: UpdateRoundDto) {
    const round = await this.roundModel.findOne({ poolId, roundNumber });
    if (!round) throw new BadRequestException('Рундът не съществува');

    if (round.isClosed)
      throw new BadRequestException('Closed round cannot be edited');

    // Only assign defined fields so we never overwrite required fields (e.g. matches) with undefined
    if (dto.matches !== undefined) round.matches = dto.matches;
    if (dto.pickDeadline !== undefined) round.pickDeadline = dto.pickDeadline;
    return round.save();
  }

  async deleteRound(poolId: string, roundNumber: number) {
    const round = await this.roundModel.findOne({ poolId, roundNumber });
    if (!round) throw new BadRequestException('Рундът не съществува');

    if (round.isClosed)
      throw new BadRequestException('Closed round cannot be deleted');

    await this.pickModel.deleteMany({ poolId, round: roundNumber });
    await round.deleteOne();

    return { message: 'Рундът е изтрит успешно' };
  }

  /** ---------------- USERS ---------------- */
  async deleteUser(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    if (user.role === 'admin') {
      const adminCount = await this.usersService.countAdmins();
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot delete the last admin user');
      }
    }

    await this.participantModel.deleteMany({ userId });
    await this.pickModel.deleteMany({ userId });
    await this.usersService.deleteUser(userId);

    return { message: 'User deleted successfully' };
  }

  /** ---------------- ROUND RESULTS (DELEGATED) ---------------- */
  async recordRoundResults(
    poolId: string,
    roundNumber: number,
    results: {
      homeTeam: string;
      awayTeam: string;
      homeGoals: number;
      awayGoals: number;
    }[],
  ) {
    return this.survivorService.recordRoundResults(poolId, {
      roundNumber,
      results,
    });
  }
}
