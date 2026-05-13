import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PickService } from '../../src/modules/pick/pick.service';
import { ParticipantService } from '../../src/modules/participant/participant.service';
import { RoundService } from '../../src/modules/round/round.service';

describe('PickService', () => {
  let service: PickService;
  let pickModel: {
    create: jest.Mock;
    find: jest.Mock;
  };
  let participantModel: { find: jest.Mock };
  let userModel: { find: jest.Mock };
  let poolModel: { findById: jest.Mock };
  let participantService: { ensureAlive: jest.Mock };
  let roundService: { getActiveRound: jest.Mock; getRoundByNumber: jest.Mock };

  beforeEach(() => {
    pickModel = {
      create: jest.fn(),
      find: jest.fn(),
    };
    participantModel = { find: jest.fn() };
    userModel = { find: jest.fn() };
    poolModel = {
      findById: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ prizePoolEur: 0 }),
      }),
    };
    participantService = {
      ensureAlive: jest.fn().mockResolvedValue(undefined),
    } as any;
    roundService = {
      getActiveRound: jest.fn(),
      getRoundByNumber: jest.fn(),
    } as any;

    service = new PickService(
      pickModel as any,
      participantModel as any,
      userModel as any,
      poolModel as any,
      participantService,
      roundService,
    );
  });

  describe('pickTeam', () => {
    it('calls ensureAlive then getActiveRound', async () => {
      roundService.getActiveRound.mockResolvedValue({
        roundNumber: 1,
        matches: [{ homeTeam: 'A', awayTeam: 'B' }],
        pickDeadline: null,
      });
      pickModel.create.mockResolvedValue({});

      await service.pickTeam('pool1', 'user1', { team: 'A' });

      expect(participantService.ensureAlive).toHaveBeenCalledWith('pool1', 'user1');
      expect(roundService.getActiveRound).toHaveBeenCalledWith('pool1');
    });

    it('throws when pick deadline has passed', async () => {
      const past = new Date(Date.now() - 10000);
      roundService.getActiveRound.mockResolvedValue({
        roundNumber: 1,
        matches: [{ homeTeam: 'A', awayTeam: 'B' }],
        pickDeadline: past,
      });

      await expect(
        service.pickTeam('pool1', 'user1', { team: 'A' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.pickTeam('pool1', 'user1', { team: 'A' }),
      ).rejects.toThrow('Pick deadline has passed');
      expect(pickModel.create).not.toHaveBeenCalled();
    });

    it('throws when team is not in current round', async () => {
      roundService.getActiveRound.mockResolvedValue({
        roundNumber: 1,
        matches: [{ homeTeam: 'A', awayTeam: 'B' }],
        pickDeadline: null,
      });

      await expect(
        service.pickTeam('pool1', 'user1', { team: 'C' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.pickTeam('pool1', 'user1', { team: 'C' }),
      ).rejects.toThrow('Отборът не участва в текущия рунд');
      expect(pickModel.create).not.toHaveBeenCalled();
    });

    it('creates pick and returns message and round on success', async () => {
      roundService.getActiveRound.mockResolvedValue({
        roundNumber: 1,
        matches: [{ homeTeam: 'A', awayTeam: 'B' }],
        pickDeadline: null,
      });
      pickModel.create.mockResolvedValue({});

      const result = await service.pickTeam('pool1', 'user1', { team: 'A' });

      expect(pickModel.create).toHaveBeenCalledWith({
        poolId: 'pool1',
        userId: 'user1',
        team: 'A',
        round: 1,
      });
      expect(result).toEqual({
        message: 'Успешно избрахте A',
        round: 1,
      });
    });

    it('throws BadRequest on duplicate key (code 11000)', async () => {
      roundService.getActiveRound.mockResolvedValue({
        roundNumber: 1,
        matches: [{ homeTeam: 'A', awayTeam: 'B' }],
        pickDeadline: null,
      });
      pickModel.create.mockRejectedValue({ code: 11000 });

      await expect(
        service.pickTeam('pool1', 'user1', { team: 'A' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.pickTeam('pool1', 'user1', { team: 'A' }),
      ).rejects.toThrow(/рунд|отбор/);
    });

    it('re-throws non-duplicate errors', async () => {
      roundService.getActiveRound.mockResolvedValue({
        roundNumber: 1,
        matches: [{ homeTeam: 'A', awayTeam: 'B' }],
        pickDeadline: null,
      });
      const err = new Error('DB error');
      pickModel.create.mockRejectedValue(err);

      await expect(
        service.pickTeam('pool1', 'user1', { team: 'A' }),
      ).rejects.toThrow(err);
    });
  });

  describe('getUserStatus', () => {
    it('finds picks by poolId and userId, sorts by round, returns lean', async () => {
      const chain = { sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([{ round: 1 }]) }) };
      pickModel.find.mockReturnValue(chain);

      const result = await service.getUserStatus('pool1', 'user1');

      expect(pickModel.find).toHaveBeenCalledWith({ poolId: 'pool1', userId: 'user1' });
      expect(chain.sort).toHaveBeenCalledWith({ round: 1 });
      expect(result).toEqual([{ round: 1 }]);
    });
  });

  describe('getAllUsersStatus', () => {
    it('finds picks by poolId, sorts by userId and round, returns lean', async () => {
      const chain = { sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) };
      pickModel.find.mockReturnValue(chain);

      const result = await service.getAllUsersStatus('pool1');

      expect(pickModel.find).toHaveBeenCalledWith({ poolId: 'pool1' });
      expect(chain.sort).toHaveBeenCalledWith({ userId: 1, round: 1 });
      expect(result).toEqual([]);
    });
  });

  describe('getTeamsUsedByUser', () => {
    it('returns array of team names from user picks', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ team: 'A' }, { team: 'B' }]),
      };
      pickModel.find.mockReturnValue(chain);

      const result = await service.getTeamsUsedByUser('pool1', 'user1');

      expect(pickModel.find).toHaveBeenCalledWith({ poolId: 'pool1', userId: 'user1' });
      expect(chain.select).toHaveBeenCalledWith('team');
      expect(result).toEqual(['A', 'B']);
    });
  });

  describe('getRoundStats', () => {
    it('throws NotFoundException when round does not exist', async () => {
      roundService.getRoundByNumber.mockRejectedValue(new Error('Not found'));

      await expect(service.getRoundStats('pool1', 5)).rejects.toThrow(NotFoundException);
      await expect(service.getRoundStats('pool1', 5)).rejects.toThrow(/Round 5 not found/);
    });

    it('returns round stats structure when round exists', async () => {
      roundService.getRoundByNumber.mockResolvedValue({});
      pickModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            { userId: 'u1', team: 'A', createdAt: new Date() },
          ]),
        }),
      });
      participantModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ userId: 'u1' }]),
        }),
      });
      userModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ _id: 'u1', username: 'user1', email: 'u@b.com' }]),
        }),
      });

      const result = await service.getRoundStats('pool1', 1);

      expect(result).toMatchObject({
        roundNumber: 1,
        picksIn: 1,
        stillDeciding: expect.any(Number),
        teamsPicked: 1,
        pickDistribution: expect.any(Array),
        recentPicks: expect.any(Array),
        allPicks: expect.any(Array),
      });
    });
  });

  describe('getLeaderboard', () => {
    it('returns empty structure when no participants', async () => {
      poolModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ prizePoolEur: 100 }),
      });
      participantModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
      });

      const result = await service.getLeaderboard('pool1');

      expect(result).toEqual({
        entries: [],
        totalPlayers: 0,
        alivePlayers: 0,
        prizePoolEur: 100,
        winnerCount: 0,
      });
    });

    it('returns prizePoolEur 0 when pool not found', async () => {
      poolModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });
      participantModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
      });

      const result = await service.getLeaderboard('pool1');

      expect(result.prizePoolEur).toBe(0);
    });

    it('returns entries with participants and picks', async () => {
      poolModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ prizePoolEur: 50 }),
      });
      participantModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            { userId: 'u1', eliminated: false, status: 'approved' },
          ]),
        }),
      });
      userModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            { _id: 'u1', username: 'alice', email: 'a@b.com' },
          ]),
        }),
      });
      pickModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            { userId: 'u1', round: 1, team: 'A', eliminated: false, createdAt: new Date() },
          ]),
        }),
      });

      const result = await service.getLeaderboard('pool1');

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0]).toMatchObject({
        userId: 'u1',
        username: 'alice',
        roundsSurvived: 1,
        isEliminated: false,
        isWinner: false,
        totalPicks: 1,
      });
      expect(result.totalPlayers).toBe(1);
      expect(result.alivePlayers).toBe(1);
      expect(result.prizePoolEur).toBe(50);
    });
  });
});
