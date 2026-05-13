import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { POOL_PARTICIPANTS_MODEL } from './participant.providers';
import { PoolParticipant } from './participant.interface';

@Injectable()
export class ParticipantService {
  constructor(
    @Inject(POOL_PARTICIPANTS_MODEL)
    private readonly participantModel: Model<PoolParticipant>,
  ) {}

  async joinPool(poolId: string, userId: string) {
    return this.participantModel.create({
      poolId,
      userId,
      status: 'pending',
    });
  }

  async approve(poolId: string, userId: string) {
    return this.participantModel.findOneAndUpdate(
      { poolId, userId, status: 'pending' },
      {
        status: 'approved',
        approvedAt: new Date(),
      },
      { new: true },
    );
  }

  async reject(poolId: string, userId: string) {
    return this.participantModel.findOneAndUpdate(
      { poolId, userId, status: 'pending' },
      { status: 'rejected' },
      { new: true },
    );
  }

  async eliminate(
    poolId: string,
    userId: string,
    reason?: 'team_lost' | 'no_pick',
  ) {
    return this.participantModel.findOneAndUpdate(
      { poolId, userId, status: 'approved' },
      {
        eliminated: true,
        eliminatedAt: new Date(),
        ...(reason && { eliminatedReason: reason }),
      },
    );
  }

  async markWinners(poolId: string, userIds: string[]) {
    return this.participantModel.updateMany(
      { poolId, userId: { $in: userIds } },
      {
        status: 'winner',
        winnerAt: new Date(),
        eliminated: false,
      },
    );
  }

  async getAliveParticipants(poolId: string) {
    return this.participantModel.find({
      poolId,
      status: 'approved',
      eliminated: { $ne: true },
    });
  }

  async getParticipantStatus(poolId: string, userId: string) {
    const p = await this.participantModel.findOne({ poolId, userId });
    if (!p) return { status: 'none' };

    return {
      status: p.status,
      eliminated: p.eliminated,
    };
  }

  async ensureAlive(poolId: string, userId: string) {
    const p = await this.participantModel.findOne({ poolId, userId });

    if (!p || p.status !== 'approved')
      throw new BadRequestException('Не участвате в този pool');

    if (p.eliminated)
      throw new BadRequestException('Вече сте отпаднали от играта');
  }

  async ensureApproved(poolId: string, userId: string) {
    const p = await this.participantModel.findOne({ poolId, userId });
    if (!p || (p.status !== 'approved' && p.status !== 'winner')) {
      throw new BadRequestException('Не участвате в този pool');
    }
  }
}
