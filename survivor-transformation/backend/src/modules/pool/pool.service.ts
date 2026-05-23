import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { POOLS_MODEL } from './pool.providers';
import { POOL_PARTICIPANTS_MODEL } from '../participant/participant.providers';
import { Pool } from './pool.interface';

@Injectable()
export class PoolService {
  constructor(
    @Inject(POOLS_MODEL)
    private readonly poolModel: Model<Pool>,

    @Inject(POOL_PARTICIPANTS_MODEL)
    private readonly participantModel: Model<any>,
  ) {}

  async getMyPoolMemberships(userId: string) {
    const participants = await this.participantModel
      .find({ userId })
      .populate('poolId', 'name status')
      .lean();
    return participants.map((p: any) => {
      const pool = p.poolId;
      return {
        poolId: String(pool?._id ?? p.poolId),
        poolName: pool?.name ?? '',
        status: p.status,
        eliminated: !!p.eliminated,
        eliminatedReason: p.eliminatedReason,
      };
    });
  }

  async getOpenPools(userId: string) {
    const openPools = await this.poolModel
      .find({
        status: { $in: ['open', 'active'] },
      })
      .lean();

    const myPoolIds = await this.participantModel.distinct('poolId', {
      userId,
    });
    const myPools = myPoolIds.length
      ? await this.poolModel.find({ _id: { $in: myPoolIds } }).lean()
      : [];
    const openIds = new Set(openPools.map((p: any) => String(p._id)));
    const extraPools = myPools.filter((p: any) => !openIds.has(String(p._id)));

    const allPools = [...openPools, ...extraPools];

    return Promise.all(
      allPools.map(async (pool: any) => {
        const count = await this.participantModel.countDocuments({
          poolId: pool._id,
        });
        const approvedCount = await this.participantModel.countDocuments({
          poolId: pool._id,
          status: 'approved',
        });

        return {
          id: String(pool._id),
          name: pool.name ?? '',
          status: pool.status,
          participants: count,
          approvedParticipants: approvedCount,
          tournamentKey: pool.tournamentKey ?? undefined,
        };
      }),
    );
  }

  async joinPool(poolId: string, userId: string) {
    const pool = await this.poolModel.findById(poolId);
    if (!pool) throw new BadRequestException('Pool not found');

    if (pool.status !== 'open') {
      throw new BadRequestException('Pool is closed for joining');
    }

    try {
      return await this.participantModel.create({
        poolId,
        userId,
        status: 'pending',
      });
    } catch (e: any) {
      if (e.code === 11000) {
        throw new BadRequestException('Already joined');
      }
      throw e;
    }
  }

  async getMyStatus(poolId: string, userId: string) {
    const pool = await this.poolModel.findById(poolId).lean();
    if (!pool) throw new BadRequestException('Pool not found');

    const participant = await this.participantModel.findOne({
      poolId,
      userId,
    });

    const playersRemaining = await this.participantModel.countDocuments({
      poolId,
      status: 'approved',
      eliminated: { $ne: true },
    });

    const base = {
      name: pool.name ?? '',
      tournamentKey: pool.tournamentKey ?? undefined,
      poolStatus: pool.status,
      playersRemaining,
    };

    if (!participant) return { status: 'none', eliminated: false, ...base };
    return {
      status: participant.status,
      eliminated: !!participant.eliminated,
      eliminatedReason: participant.eliminatedReason,
      ...base,
    };
  }
}
