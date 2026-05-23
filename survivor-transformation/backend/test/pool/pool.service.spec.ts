import { BadRequestException } from '@nestjs/common';
import { PoolService } from '../../src/modules/pool/pool.service';

describe('PoolService', () => {
  let service: PoolService;
  let poolModel: { find: jest.Mock; findById: jest.Mock };
  let participantModel: {
    find: jest.Mock;
    distinct: jest.Mock;
    create: jest.Mock;
    findOne: jest.Mock;
    countDocuments: jest.Mock;
  };

  beforeEach(() => {
    poolModel = {
      find: jest.fn(),
      findById: jest.fn(),
    };
    participantModel = {
      find: jest.fn(),
      distinct: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      countDocuments: jest.fn(),
    };
    service = new PoolService(poolModel as any, participantModel as any);
  });

  describe('getMyPoolMemberships', () => {
    it('finds participants by userId, populates poolId, maps to poolId poolName status eliminated', async () => {
      const chain = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          {
            poolId: { _id: 'p1', name: 'Pool 1', status: 'open' },
            status: 'approved',
            eliminated: false,
            eliminatedReason: null,
          },
        ]),
      };
      participantModel.find.mockReturnValue(chain);

      const result = await service.getMyPoolMemberships('user1');

      expect(participantModel.find).toHaveBeenCalledWith({ userId: 'user1' });
      expect(chain.populate).toHaveBeenCalledWith('poolId', 'name status');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        poolId: 'p1',
        poolName: 'Pool 1',
        status: 'approved',
        eliminated: false,
      });
    });

    it('handles missing populated poolId (poolName empty)', async () => {
      const chain = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { poolId: null, status: 'pending', eliminated: false },
        ]),
      };
      participantModel.find.mockReturnValue(chain);

      const result = await service.getMyPoolMemberships('user1');

      expect(result[0].poolName).toBe('');
      expect(result[0].status).toBe('pending');
    });
  });

  describe('getOpenPools', () => {
    it('returns open and active pools plus user pools not in open list, with counts', async () => {
      poolModel.find
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue([
            { _id: 'p1', name: 'Open 1', status: 'open', tournamentKey: 'euro' },
          ]),
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue([]),
        });
      participantModel.distinct.mockResolvedValue(['p1']);
      participantModel.countDocuments.mockResolvedValue(3);
      participantModel.countDocuments
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);

      const result = await service.getOpenPools('user1');

      expect(poolModel.find).toHaveBeenCalledWith({
        status: { $in: ['open', 'active'] },
      });
      expect(participantModel.distinct).toHaveBeenCalledWith('poolId', {
        userId: 'user1',
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'p1',
        name: 'Open 1',
        status: 'open',
        participants: 3,
        approvedParticipants: 2,
        tournamentKey: 'euro',
      });
    });
  });

  describe('joinPool', () => {
    it('throws when pool not found', async () => {
      poolModel.findById.mockResolvedValue(null);

      await expect(service.joinPool('p1', 'user1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.joinPool('p1', 'user1')).rejects.toThrow(
        'Pool not found',
      );
      expect(participantModel.create).not.toHaveBeenCalled();
    });

    it('throws when pool status is not open', async () => {
      poolModel.findById.mockResolvedValue({ status: 'active' });

      await expect(service.joinPool('p1', 'user1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.joinPool('p1', 'user1')).rejects.toThrow(
        'Pool is closed for joining',
      );
      expect(participantModel.create).not.toHaveBeenCalled();
    });

    it('creates participant with pending status on success', async () => {
      poolModel.findById.mockResolvedValue({ status: 'open' });
      const created = { poolId: 'p1', userId: 'user1', status: 'pending' };
      participantModel.create.mockResolvedValue(created);

      const result = await service.joinPool('p1', 'user1');

      expect(participantModel.create).toHaveBeenCalledWith({
        poolId: 'p1',
        userId: 'user1',
        status: 'pending',
      });
      expect(result).toBe(created);
    });

    it('throws Already joined on duplicate key (11000)', async () => {
      poolModel.findById.mockResolvedValue({ status: 'open' });
      participantModel.create.mockRejectedValue({ code: 11000 });

      await expect(service.joinPool('p1', 'user1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.joinPool('p1', 'user1')).rejects.toThrow(
        'Already joined',
      );
    });

    it('re-throws non-duplicate errors', async () => {
      poolModel.findById.mockResolvedValue({ status: 'open' });
      const err = new Error('DB error');
      participantModel.create.mockRejectedValue(err);

      await expect(service.joinPool('p1', 'user1')).rejects.toThrow(err);
    });
  });

  describe('getMyStatus', () => {
    it('throws when pool not found', async () => {
      poolModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getMyStatus('p1', 'user1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getMyStatus('p1', 'user1')).rejects.toThrow(
        'Pool not found',
      );
    });

    it('returns status none when user is not participant', async () => {
      poolModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: 'p1',
          name: 'Pool',
          status: 'open',
          tournamentKey: 'euro',
        }),
      });
      participantModel.findOne.mockResolvedValue(null);
      participantModel.countDocuments.mockResolvedValue(5);

      const result = await service.getMyStatus('p1', 'user1');

      expect(result).toMatchObject({
        status: 'none',
        eliminated: false,
        name: 'Pool',
        tournamentKey: 'euro',
        poolStatus: 'open',
        playersRemaining: 5,
      });
    });

    it('returns participant status and base fields when participant exists', async () => {
      poolModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: 'p1',
          name: 'Pool',
          status: 'active',
        }),
      });
      participantModel.findOne.mockResolvedValue({
        status: 'approved',
        eliminated: true,
        eliminatedReason: 'team_lost',
      });
      participantModel.countDocuments.mockResolvedValue(3);

      const result = await service.getMyStatus('p1', 'user1');

      expect(result).toMatchObject({
        status: 'approved',
        eliminated: true,
        eliminatedReason: 'team_lost',
        name: 'Pool',
        poolStatus: 'active',
        playersRemaining: 3,
      });
    });
  });
});
