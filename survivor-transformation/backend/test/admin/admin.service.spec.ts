import { BadRequestException } from '@nestjs/common';
import { AdminService } from '../../src/modules/admin/admin.service';

type MockModel<T = any> = {
  create: jest.Mock;
  findById: jest.Mock;
  findByIdAndDelete: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  deleteMany: jest.Mock;
  countDocuments: jest.Mock;
};

const createMockModel = (): MockModel => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn(),
});

const createMockDocument = (initial: Record<string, any> = {}) => {
  return {
    ...initial,
    save: jest.fn().mockResolvedValue(initial),
    deleteOne: jest.fn().mockResolvedValue(undefined),
  };
};

describe('AdminService', () => {
  let service: AdminService;
  let poolModel: MockModel;
  let participantModel: MockModel;
  let roundModel: MockModel;
  let pickModel: MockModel;
  let survivorService: { recordRoundResults: jest.Mock };
  let usersService: {
    findById: jest.Mock;
    countAdmins: jest.Mock;
    deleteUser: jest.Mock;
  };
  let rakeService: { getPrizePoolEur: jest.Mock; getRakeEur: jest.Mock };

  beforeEach(() => {
    poolModel = createMockModel();
    participantModel = createMockModel();
    roundModel = createMockModel();
    pickModel = createMockModel();
    survivorService = {
      recordRoundResults: jest.fn(),
    };
    usersService = {
      findById: jest.fn(),
      countAdmins: jest.fn(),
      deleteUser: jest.fn(),
    };
    rakeService = {
      getPrizePoolEur: jest.fn((n: number) => n * 40),
      getRakeEur: jest.fn((n: number) => n * 10),
    };

    service = new AdminService(
      // order must match constructor in service
      poolModel as any,
      participantModel as any,
      roundModel as any,
      pickModel as any,
      survivorService as any,
      usersService as any,
      rakeService as any,
    );
  });

  describe('createPool', () => {
    it('should create a pool with open status', async () => {
      const dto = { name: 'Test Pool', description: 'desc', createdBy: 'admin1' };
      const created = { id: 'pool1', ...dto, status: 'open' };
      poolModel.create.mockResolvedValue(created);

      const result = await service.createPool(dto as any);

      expect(poolModel.create).toHaveBeenCalledWith({
        ...dto,
        status: 'open',
      });
      expect(result).toBe(created);
    });
  });

  describe('startPool', () => {
    it('should throw when pool does not exist', async () => {
      poolModel.findById.mockResolvedValue(null);

      await expect(service.startPool('missing')).rejects.toThrow(
        new BadRequestException('Pool не съществува'),
      );
    });

    it('should throw when pool is not open', async () => {
      const pool = createMockDocument({ status: 'active' });
      poolModel.findById.mockResolvedValue(pool);

      await expect(service.startPool('pool1')).rejects.toThrow(
        new BadRequestException('Pool already started or finished'),
      );
    });

    it('should validate there is at least one approved participant', async () => {
      const pool = createMockDocument({ status: 'open' });
      poolModel.findById.mockResolvedValue(pool);
      participantModel.countDocuments.mockResolvedValue(0);
      roundModel.find.mockResolvedValue([]);

      await expect(service.startPool('pool1')).rejects.toThrow(
        new BadRequestException(
          'Cannot start pool without at least one approved participant.',
        ),
      );
    });

    it('should validate there is at least one round', async () => {
      const pool = createMockDocument({ status: 'open' });
      poolModel.findById.mockResolvedValue(pool);
      participantModel.countDocuments.mockResolvedValue(1);
      roundModel.find.mockResolvedValue([]);

      await expect(service.startPool('pool1')).rejects.toThrow(
        new BadRequestException(
          'No rounds created yet. Create a round in the Rounds & Results tab.',
        ),
      );
    });

    it('should validate there is at least one match in some round', async () => {
      const pool = createMockDocument({ status: 'open' });
      poolModel.findById.mockResolvedValue(pool);
      participantModel.countDocuments.mockResolvedValue(1);
      roundModel.find.mockResolvedValue([{ matches: [] }]);

      await expect(service.startPool('pool1')).rejects.toThrow(
        new BadRequestException(
          'No matches created yet. Add at least one match to a round in the Rounds & Results tab.',
        ),
      );
    });

    it('should start pool and set prizePoolEur, rakeEur, status and startedAt', async () => {
      const pool = createMockDocument({ status: 'open' });
      poolModel.findById.mockResolvedValue(pool);
      participantModel.countDocuments.mockResolvedValue(2);
      roundModel.find.mockResolvedValue([{ matches: [{ homeTeam: 'A', awayTeam: 'B' }] }]);

      const result = await service.startPool('pool1');

      expect(rakeService.getPrizePoolEur).toHaveBeenCalledWith(2);
      expect(rakeService.getRakeEur).toHaveBeenCalledWith(2);
      expect(pool.prizePoolEur).toBe(2 * 40);
      expect(pool.rakeEur).toBe(2 * 10);
      expect(pool.status).toBe('active');
      expect(pool.startedAt).toBeInstanceOf(Date);
      expect(pool.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Pool started successfully' });
    });
  });

  describe('updatePool', () => {
    it('should throw when pool does not exist', async () => {
      poolModel.findById.mockResolvedValue(null);

      await expect(
        service.updatePool('missing', { name: 'New' } as any),
      ).rejects.toThrow(new BadRequestException('Pool не съществува'));
    });

    it('should prevent editing finished pool', async () => {
      const pool = createMockDocument({ status: 'finished' });
      poolModel.findById.mockResolvedValue(pool);

      await expect(
        service.updatePool('pool1', { name: 'New' } as any),
      ).rejects.toThrow(new BadRequestException('Finished pool cannot be edited'));
    });

    it('should call startPool when setting status to active and then merge other fields', async () => {
      const pool = createMockDocument({
        status: 'open',
        name: 'Old',
        description: 'Old',
      });
      const updated = createMockDocument({
        status: 'active',
        name: 'Old',
        description: 'Old',
      });
      poolModel.findById
        .mockResolvedValueOnce(pool)
        .mockResolvedValueOnce(updated);

      const startPoolSpy = jest
        .spyOn(service, 'startPool')
        .mockResolvedValue({ message: 'Pool started successfully' });

      const result = await service.updatePool('pool1', {
        status: 'active',
        name: 'New',
      } as any);

      expect(startPoolSpy).toHaveBeenCalledWith('pool1');
      expect(updated.save).toHaveBeenCalled();
      expect(updated.status).toBe('active');
      expect(updated.name).toBe('New');
      expect(result).toBeDefined();
    });

    it('should update pool fields directly when not activating', async () => {
      const pool = createMockDocument({ status: 'open', name: 'Old' });
      poolModel.findById.mockResolvedValue(pool);

      const result = await service.updatePool('pool1', {
        name: 'New',
        description: 'Desc',
      } as any);

      expect(pool.save).toHaveBeenCalled();
      expect(pool.name).toBe('New');
      expect(pool.description).toBe('Desc');
      expect(result).toBeDefined();
    });
  });

  describe('deletePool', () => {
    it('should throw when pool does not exist', async () => {
      poolModel.findById.mockResolvedValue(null);

      await expect(service.deletePool('missing')).rejects.toThrow(
        new BadRequestException('Pool не съществува'),
      );
    });

    it('should delete related entities and the pool', async () => {
      const pool = createMockDocument({ id: 'pool1' });
      poolModel.findById.mockResolvedValue(pool);
      const deleted = { id: 'pool1', deleted: true };
      poolModel.findByIdAndDelete.mockResolvedValue(deleted);

      const result = await service.deletePool('pool1');

      expect(participantModel.deleteMany).toHaveBeenCalledWith({ poolId: 'pool1' });
      expect(roundModel.deleteMany).toHaveBeenCalledWith({ poolId: 'pool1' });
      expect(pickModel.deleteMany).toHaveBeenCalledWith({ poolId: 'pool1' });
      expect(result).toBe(deleted);
    });
  });

  describe('participants', () => {
    it('approveParticipant should approve pending participant', async () => {
      const participant = createMockDocument({
        status: 'pending',
        approvedAt: undefined,
      });
      participantModel.findById.mockResolvedValue(participant);

      const result = await service.approveParticipant('p1', {} as any);

      expect(participant.status).toBe('approved');
      expect(participant.approvedAt).toBeInstanceOf(Date);
      expect(participant.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('approveParticipant should reject non-pending participant', async () => {
      const participant = createMockDocument({
        status: 'approved',
      });
      participantModel.findById.mockResolvedValue(participant);

      await expect(
        service.approveParticipant('p1', {} as any),
      ).rejects.toThrow(new BadRequestException('Участникът вече е обработен'));
    });

    it('updateParticipant should merge fields and save', async () => {
      const participant = createMockDocument({
        status: 'pending',
      });
      participantModel.findById.mockResolvedValue(participant);

      const result = await service.updateParticipant('p1', {
        status: 'approved',
      } as any);

      expect(participant.status).toBe('approved');
      expect(participant.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('deleteParticipant should delete their picks and participant', async () => {
      const participant = createMockDocument({
        userId: 'u1',
        poolId: 'pool1',
      });
      participantModel.findById.mockResolvedValue(participant);

      const result = await service.deleteParticipant('p1');

      expect(pickModel.deleteMany).toHaveBeenCalledWith({
        userId: 'u1',
        poolId: 'pool1',
      });
      expect(participant.deleteOne).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Участникът е изтрит успешно' });
    });

    it('getParticipants should return all for a pool', async () => {
      const participants = [{ id: 'p1' }, { id: 'p2' }];
      participantModel.find.mockReturnValue(participants);

      const result = await service.getParticipants('pool1');

      expect(participantModel.find).toHaveBeenCalledWith({ poolId: 'pool1' });
      expect(result).toBe(participants);
    });
  });

  describe('rounds', () => {
    it('getRounds should sort by roundNumber ascending', async () => {
      const lean = jest.fn().mockResolvedValue('sorted');
      const sort = jest.fn().mockReturnValue({ lean });
      const query = { sort };
      roundModel.find.mockReturnValue(query as any);

      const result = await service.getRounds('pool1');

      expect(roundModel.find).toHaveBeenCalledWith({ poolId: 'pool1' });
      expect(sort).toHaveBeenCalledWith({ roundNumber: 1 });
      expect(lean).toHaveBeenCalled();
      expect(result).toBe('sorted');
    });

    it('addRound should reject duplicate teams in the same round', async () => {
      const dto = {
        roundNumber: 1,
        matches: [
          { homeTeam: 'A', awayTeam: 'B' },
          { homeTeam: 'A', awayTeam: 'C' },
        ],
      };

      await expect(service.addRound('pool1', dto as any)).rejects.toThrow(
        new BadRequestException('Duplicate teams are not allowed in the same round'),
      );
      expect(roundModel.create).not.toHaveBeenCalled();
    });

    it('addRound should create round with pickDeadline when provided', async () => {
      const dto = {
        roundNumber: 1,
        matches: [{ homeTeam: 'A', awayTeam: 'B' }],
        pickDeadline: new Date(),
      };
      const created = { id: 'r1', ...dto };
      roundModel.create.mockResolvedValue(created);

      const result = await service.addRound('pool1', dto as any);

      expect(roundModel.create).toHaveBeenCalledWith({
        poolId: 'pool1',
        roundNumber: dto.roundNumber,
        matches: dto.matches,
        isClosed: false,
        pickDeadline: dto.pickDeadline,
      });
      expect(result).toBe(created);
    });

    it('updateRound should reject when round does not exist', async () => {
      roundModel.findOne.mockResolvedValue(null);

      await expect(
        service.updateRound('pool1', 1, {} as any),
      ).rejects.toThrow(new BadRequestException('Рундът не съществува'));
    });

    it('updateRound should reject when round is closed', async () => {
      const round = createMockDocument({ isClosed: true });
      roundModel.findOne.mockResolvedValue(round);

      await expect(
        service.updateRound('pool1', 1, {} as any),
      ).rejects.toThrow(new BadRequestException('Closed round cannot be edited'));
    });

    it('updateRound should update only defined fields', async () => {
      const round = createMockDocument({
        isClosed: false,
        matches: [{ homeTeam: 'A', awayTeam: 'B' }],
        pickDeadline: undefined,
      });
      roundModel.findOne.mockResolvedValue(round);

      const dto = {
        matches: [{ homeTeam: 'C', awayTeam: 'D' }],
      };

      const result = await service.updateRound('pool1', 1, dto as any);

      expect(round.matches).toEqual(dto.matches);
      expect(round.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('deleteRound should reject when round does not exist', async () => {
      roundModel.findOne.mockResolvedValue(null);

      await expect(service.deleteRound('pool1', 1)).rejects.toThrow(
        new BadRequestException('Рундът не съществува'),
      );
    });

    it('deleteRound should reject when round is closed', async () => {
      const round = createMockDocument({ isClosed: true });
      roundModel.findOne.mockResolvedValue(round);

      await expect(service.deleteRound('pool1', 1)).rejects.toThrow(
        new BadRequestException('Closed round cannot be deleted'),
      );
    });

    it('deleteRound should delete picks and round', async () => {
      const round = createMockDocument({ isClosed: false });
      roundModel.findOne.mockResolvedValue(round);

      const result = await service.deleteRound('pool1', 1);

      expect(pickModel.deleteMany).toHaveBeenCalledWith({
        poolId: 'pool1',
        round: 1,
      });
      expect(round.deleteOne).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Рундът е изтрит успешно' });
    });
  });

  describe('deleteUser', () => {
    it('should reject when user does not exist', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.deleteUser('u1')).rejects.toThrow(
        new BadRequestException('User not found'),
      );
    });

    it('should prevent deleting the last admin', async () => {
      usersService.findById.mockResolvedValue({ id: 'u1', role: 'admin' });
      usersService.countAdmins.mockResolvedValue(1);

      await expect(service.deleteUser('u1')).rejects.toThrow(
        new BadRequestException('Cannot delete the last admin user'),
      );
      expect(usersService.deleteUser).not.toHaveBeenCalled();
    });

    it('should delete user, participants and picks for non-last admin', async () => {
      usersService.findById.mockResolvedValue({ id: 'u1', role: 'admin' });
      usersService.countAdmins.mockResolvedValue(2);

      const result = await service.deleteUser('u1');

      expect(participantModel.deleteMany).toHaveBeenCalledWith({ userId: 'u1' });
      expect(pickModel.deleteMany).toHaveBeenCalledWith({ userId: 'u1' });
      expect(usersService.deleteUser).toHaveBeenCalledWith('u1');
      expect(result).toEqual({ message: 'User deleted successfully' });
    });
  });

  describe('recordRoundResults', () => {
    it('should delegate to SurvivorService with correct payload', async () => {
      const payload = {
        poolId: 'pool1',
        roundNumber: 2,
        results: [
          { homeTeam: 'A', awayTeam: 'B', homeGoals: 1, awayGoals: 0 },
        ],
      };
      survivorService.recordRoundResults.mockResolvedValue({ ok: true });

      const result = await service.recordRoundResults(
        payload.poolId,
        payload.roundNumber,
        payload.results as any,
      );

      expect(survivorService.recordRoundResults).toHaveBeenCalledWith(
        'pool1',
        {
          roundNumber: 2,
          results: payload.results,
        },
      );
      expect(result).toEqual({ ok: true });
    });
  });
});
