import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../../src/modules/admin/admin.controller';
import { AdminService } from '../../src/modules/admin/admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let service: jest.Mocked<AdminService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            createPool: jest.fn(),
            updatePool: jest.fn(),
            deletePool: jest.fn(),
            startPool: jest.fn(),
            getPools: jest.fn(),
            approveParticipant: jest.fn(),
            updateParticipant: jest.fn(),
            deleteParticipant: jest.fn(),
            getParticipants: jest.fn(),
            getRounds: jest.fn(),
            addRound: jest.fn(),
            updateRound: jest.fn(),
            deleteRound: jest.fn(),
            recordRoundResults: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get(AdminService) as jest.Mocked<AdminService>;
  });

  describe('pool management', () => {
    it('createPool should pass dto and createdBy to service', async () => {
      const dto = { name: 'Pool', description: 'Desc' } as any;
      const userId = 'admin-id';
      const created = { id: 'pool1', ...dto, createdBy: userId };
      service.createPool.mockResolvedValue(created as any);

      const result = await controller.createPool(dto, userId);

      expect(service.createPool).toHaveBeenCalledWith({
        ...dto,
        createdBy: userId,
      });
      expect(result).toBe(created);
    });

    it('updatePool should call service with poolId and dto', async () => {
      const dto = { name: 'New name' } as any;
      const updated = { id: 'pool1', ...dto };
      service.updatePool.mockResolvedValue(updated as any);

      const result = await controller.updatePool('pool1', dto);

      expect(service.updatePool).toHaveBeenCalledWith('pool1', dto);
      expect(result).toBe(updated);
    });

    it('deletePool should call service with poolId', async () => {
      const deleted = { id: 'pool1' };
      service.deletePool.mockResolvedValue(deleted as any);

      const result = await controller.deletePool('pool1');

      expect(service.deletePool).toHaveBeenCalledWith('pool1');
      expect(result).toBe(deleted);
    });

    it('startPool should call service with poolId', async () => {
      const response = { message: 'started' };
      service.startPool.mockResolvedValue(response as any);

      const result = await controller.startPool('pool1');

      expect(service.startPool).toHaveBeenCalledWith('pool1');
      expect(result).toBe(response);
    });

    it('getPools should call service', async () => {
      const pools = [{ id: 'pool1' }];
      service.getPools.mockResolvedValue(pools as any);

      const result = await controller.getPools();

      expect(service.getPools).toHaveBeenCalled();
      expect(result).toBe(pools);
    });
  });

  describe('participant management', () => {
    it('approveParticipant should call service with id and dto', async () => {
      const dto = {} as any;
      const participant = { id: 'p1' };
      service.approveParticipant.mockResolvedValue(participant as any);

      const result = await controller.approveParticipant('p1', dto);

      expect(service.approveParticipant).toHaveBeenCalledWith('p1', dto);
      expect(result).toBe(participant);
    });

    it('updateParticipant should call service with id and dto', async () => {
      const dto = { status: 'approved' } as any;
      const participant = { id: 'p1', ...dto };
      service.updateParticipant.mockResolvedValue(participant as any);

      const result = await controller.updateParticipant('p1', dto);

      expect(service.updateParticipant).toHaveBeenCalledWith('p1', dto);
      expect(result).toBe(participant);
    });

    it('deleteParticipant should call service with id', async () => {
      const response = { message: 'ok' };
      service.deleteParticipant.mockResolvedValue(response as any);

      const result = await controller.deleteParticipant('p1');

      expect(service.deleteParticipant).toHaveBeenCalledWith('p1');
      expect(result).toBe(response);
    });

    it('getParticipants should call service with poolId', async () => {
      const participants = [{ id: 'p1' }];
      service.getParticipants.mockResolvedValue(participants as any);

      const result = await controller.getParticipants('pool1');

      expect(service.getParticipants).toHaveBeenCalledWith('pool1');
      expect(result).toBe(participants);
    });
  });

  describe('round management', () => {
    it('getRounds should call service with poolId', async () => {
      const rounds = [{ id: 'r1' }];
      service.getRounds.mockResolvedValue(rounds as any);

      const result = await controller.getRounds('pool1');

      expect(service.getRounds).toHaveBeenCalledWith('pool1');
      expect(result).toBe(rounds);
    });

    it('addRound should call service with poolId and dto', async () => {
      const dto = {
        roundNumber: 1,
        matches: [{ homeTeam: 'A', awayTeam: 'B' }],
      } as any;
      const round = { id: 'r1', ...dto };
      service.addRound.mockResolvedValue(round as any);

      const result = await controller.addRound('pool1', dto);

      expect(service.addRound).toHaveBeenCalledWith('pool1', dto);
      expect(result).toBe(round);
    });

    it('updateRound should call service with params and dto', async () => {
      const dto = { matches: [] } as any;
      const round = { id: 'r1' };
      service.updateRound.mockResolvedValue(round as any);

      const result = await controller.updateRound('pool1', 2 as any, dto);

      expect(service.updateRound).toHaveBeenCalledWith('pool1', 2 as any, dto);
      expect(result).toBe(round);
    });

    it('deleteRound should call service with params', async () => {
      const response = { message: 'deleted' };
      service.deleteRound.mockResolvedValue(response as any);

      const result = await controller.deleteRound('pool1', 2 as any);

      expect(service.deleteRound).toHaveBeenCalledWith('pool1', 2 as any);
      expect(result).toBe(response);
    });

    it('recordRoundResults should call service with params and dto.results', async () => {
      const dto = {
        results: [
          { homeTeam: 'A', awayTeam: 'B', homeGoals: 1, awayGoals: 0 },
        ],
      } as any;
      const response = { ok: true };
      service.recordRoundResults.mockResolvedValue(response as any);

      const result = await controller.recordRoundResults('pool1', 3 as any, dto);

      expect(service.recordRoundResults).toHaveBeenCalledWith(
        'pool1',
        3,
        dto.results,
      );
      expect(result).toBe(response);
    });
  });

  describe('user management', () => {
    it('deleteUser should call service with userId', async () => {
      const response = { message: 'deleted' };
      service.deleteUser.mockResolvedValue(response as any);

      const result = await controller.deleteUser('u1');

      expect(service.deleteUser).toHaveBeenCalledWith('u1');
      expect(result).toBe(response);
    });
  });
});

