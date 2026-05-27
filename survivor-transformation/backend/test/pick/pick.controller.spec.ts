import { Test, TestingModule } from '@nestjs/testing';
import { PickController } from '../../src/modules/pick/pick.controller';
import { PickService } from '../../src/modules/pick/pick.service';
import { ParticipantService } from '../../src/modules/participant/participant.service';

describe('PickController', () => {
  let controller: PickController;
  let pickService: jest.Mocked<PickService>;
  let participantService: jest.Mocked<ParticipantService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PickController],
      providers: [
        {
          provide: PickService,
          useValue: {
            pickTeam: jest.fn(),
            getUserStatus: jest.fn(),
            getAllUsersStatus: jest.fn(),
            getRoundStats: jest.fn(),
            getLeaderboard: jest.fn(),
          },
        },
        {
          provide: ParticipantService,
          useValue: {
            ensureApproved: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<PickController>(PickController);
    pickService = module.get(PickService) as jest.Mocked<PickService>;
    participantService = module.get(
      ParticipantService,
    ) as jest.Mocked<ParticipantService>;
  });

  describe('pickTeam', () => {
    it('calls pickService.pickTeam with poolId, userId and dto', async () => {
      const dto = { team: 'Germany' };
      const result = { message: 'Успешно избрахте Germany', round: 1 };
      pickService.pickTeam.mockResolvedValue(result as any);

      const out = await controller.pickTeam('pool1', 'user1', dto as any);

      expect(pickService.pickTeam).toHaveBeenCalledWith('pool1', 'user1', dto);
      expect(out).toEqual(result);
    });
  });

  describe('getMyStatus', () => {
    it('calls getUserStatus with poolId and userId', async () => {
      const picks = [{ round: 1, team: 'A' }];
      pickService.getUserStatus.mockResolvedValue(picks as any);

      const result = await controller.getMyStatus('pool1', 'user1');

      expect(pickService.getUserStatus).toHaveBeenCalledWith('pool1', 'user1');
      expect(result).toEqual(picks);
    });
  });

  describe('getAllUsersStatus', () => {
    it('calls getAllUsersStatus with poolId', async () => {
      const status = [];
      pickService.getAllUsersStatus.mockResolvedValue(status as any);

      const result = await controller.getAllUsersStatus('pool1');

      expect(pickService.getAllUsersStatus).toHaveBeenCalledWith('pool1');
      expect(result).toEqual(status);
    });
  });

  describe('getRoundStats', () => {
    it('ensures approved participant then calls getRoundStats with poolId, roundNumber and userId', async () => {
      const stats = { roundNumber: 2, picksIn: 5, stillDeciding: 3, picksRevealed: false };
      pickService.getRoundStats.mockResolvedValue(stats as any);

      const result = await controller.getRoundStats('pool1', 2, 'user1');

      expect(participantService.ensureApproved).toHaveBeenCalledWith('pool1', 'user1');
      expect(pickService.getRoundStats).toHaveBeenCalledWith('pool1', 2, 'user1');
      expect(result).toEqual(stats);
    });
  });

  describe('getLeaderboard', () => {
    it('calls getLeaderboard with poolId', async () => {
      const leaderboard = { entries: [], totalPlayers: 0, alivePlayers: 0 };
      pickService.getLeaderboard.mockResolvedValue(leaderboard as any);

      const result = await controller.getLeaderboard('pool1');

      expect(pickService.getLeaderboard).toHaveBeenCalledWith('pool1');
      expect(result).toEqual(leaderboard);
    });
  });
});
