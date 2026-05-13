import { BadRequestException } from '@nestjs/common';
import { RoundService } from '../../src/modules/round/round.service';

describe('RoundService', () => {
  let service: RoundService;
  let roundModel: {
    find: jest.Mock;
    findOne: jest.Mock;
    findByIdAndUpdate: jest.Mock;
  };

  const createMockRound = (overrides: Record<string, unknown> = {}) => ({
    poolId: 'pool1',
    roundNumber: 1,
    matches: [
      { homeTeam: 'A', awayTeam: 'B' },
      { homeTeam: 'C', awayTeam: 'D' },
    ],
    isClosed: false,
    save: jest.fn().mockResolvedValue(overrides),
    ...overrides,
  });

  beforeEach(() => {
    roundModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    service = new RoundService(roundModel as any);
  });

  describe('getAllRounds', () => {
    it('finds rounds by poolId, sorts by roundNumber ascending, returns lean', async () => {
      const chain = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ roundNumber: 1 }, { roundNumber: 2 }]),
      };
      roundModel.find.mockReturnValue(chain);

      const result = await service.getAllRounds('pool1');

      expect(roundModel.find).toHaveBeenCalledWith({ poolId: 'pool1' });
      expect(chain.sort).toHaveBeenCalledWith({ roundNumber: 1 });
      expect(chain.lean).toHaveBeenCalled();
      expect(result).toEqual([{ roundNumber: 1 }, { roundNumber: 2 }]);
    });
  });

  describe('getActiveRound', () => {
    it('throws when no open round exists', async () => {
      roundModel.findOne.mockResolvedValue(null);

      await expect(service.getActiveRound('pool1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getActiveRound('pool1')).rejects.toThrow(
        'No active round',
      );
      expect(roundModel.findOne).toHaveBeenCalledWith({
        poolId: 'pool1',
        isClosed: false,
      });
    });

    it('returns round when open round exists', async () => {
      const round = createMockRound();
      roundModel.findOne.mockResolvedValue(round);

      const result = await service.getActiveRound('pool1');

      expect(result).toBe(round);
    });
  });

  describe('getRoundByNumber', () => {
    it('throws when round not found', async () => {
      roundModel.findOne.mockResolvedValue(null);

      await expect(service.getRoundByNumber('pool1', 2)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getRoundByNumber('pool1', 2)).rejects.toThrow(
        'Round 2 not found',
      );
      expect(roundModel.findOne).toHaveBeenCalledWith({
        poolId: 'pool1',
        roundNumber: 2,
      });
    });

    it('returns round when found', async () => {
      const round = createMockRound({ roundNumber: 2 });
      roundModel.findOne.mockResolvedValue(round);

      const result = await service.getRoundByNumber('pool1', 2);

      expect(result).toBe(round);
    });
  });

  describe('setRoundResults', () => {
    it('uses getActiveRound when dto.roundNumber is not provided', async () => {
      const round = createMockRound();
      roundModel.findOne.mockResolvedValue(round);

      await service.setRoundResults('pool1', {
        results: [
          { homeTeam: 'A', awayTeam: 'B', homeGoals: 2, awayGoals: 1 },
          { homeTeam: 'C', awayTeam: 'D', homeGoals: 0, awayGoals: 0 },
        ],
      });

      expect(roundModel.findOne).toHaveBeenCalledWith({
        poolId: 'pool1',
        isClosed: false,
      });
    });

    it('uses getRoundByNumber when dto.roundNumber is provided', async () => {
      const round = createMockRound({ roundNumber: 3 });
      roundModel.findOne.mockResolvedValue(round);

      await service.setRoundResults('pool1', {
        roundNumber: 3,
        results: [
          { homeTeam: 'A', awayTeam: 'B', homeGoals: 1, awayGoals: 0 },
          { homeTeam: 'C', awayTeam: 'D', homeGoals: 1, awayGoals: 1 },
        ],
      });

      expect(roundModel.findOne).toHaveBeenCalledWith({
        poolId: 'pool1',
        roundNumber: 3,
      });
    });

    it('throws when round is already closed', async () => {
      const round = createMockRound({ isClosed: true });
      roundModel.findOne.mockResolvedValue(round);

      await expect(
        service.setRoundResults('pool1', {
          results: [
            { homeTeam: 'A', awayTeam: 'B', homeGoals: 1, awayGoals: 0 },
            { homeTeam: 'C', awayTeam: 'D', homeGoals: 0, awayGoals: 1 },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.setRoundResults('pool1', {
          results: [
            { homeTeam: 'A', awayTeam: 'B', homeGoals: 1, awayGoals: 0 },
            { homeTeam: 'C', awayTeam: 'D', homeGoals: 0, awayGoals: 1 },
          ],
        }),
      ).rejects.toThrow('already closed');
    });

    it('throws when result missing for a match', async () => {
      const round = createMockRound();
      roundModel.findOne.mockResolvedValue(round);

      await expect(
        service.setRoundResults('pool1', {
          results: [{ homeTeam: 'A', awayTeam: 'B', homeGoals: 1, awayGoals: 0 }],
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.setRoundResults('pool1', {
          results: [{ homeTeam: 'A', awayTeam: 'B', homeGoals: 1, awayGoals: 0 }],
        }),
      ).rejects.toThrow(/No result provided.*C vs D/);
    });

    it('sets home win and draw correctly and saves round', async () => {
      const round = createMockRound();
      roundModel.findOne.mockResolvedValue(round);
      const saved = { ...round, roundNumber: 1 };
      (round.save as jest.Mock).mockResolvedValue(saved);

      const result = await service.setRoundResults('pool1', {
        results: [
          { homeTeam: 'A', awayTeam: 'B', homeGoals: 2, awayGoals: 1 },
          { homeTeam: 'C', awayTeam: 'D', homeGoals: 1, awayGoals: 1 },
        ],
      });

      expect(round.matches[0]).toMatchObject({
        homeTeam: 'A',
        awayTeam: 'B',
        homeGoals: 2,
        awayGoals: 1,
        winnerTeam: 'A',
        isDraw: false,
      });
      expect(round.matches[1]).toMatchObject({
        homeTeam: 'C',
        awayTeam: 'D',
        homeGoals: 1,
        awayGoals: 1,
        isDraw: true,
      });
      expect(round.save).toHaveBeenCalled();
      expect(result).toBe(saved);
    });

    it('sets away win correctly', async () => {
      const round = createMockRound();
      roundModel.findOne.mockResolvedValue(round);
      (round.save as jest.Mock).mockResolvedValue(round);

      await service.setRoundResults('pool1', {
        results: [
          { homeTeam: 'A', awayTeam: 'B', homeGoals: 0, awayGoals: 2 },
          { homeTeam: 'C', awayTeam: 'D', homeGoals: 0, awayGoals: 0 },
        ],
      });

      expect(round.matches[0]).toMatchObject({
        winnerTeam: 'B',
        isDraw: false,
      });
    });
  });

  describe('closeRound', () => {
    it('updates round by id with isClosed true', async () => {
      roundModel.findByIdAndUpdate.mockResolvedValue(undefined);

      await service.closeRound('roundId1');

      expect(roundModel.findByIdAndUpdate).toHaveBeenCalledWith('roundId1', {
        isClosed: true,
      });
    });
  });
});
