import { NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { IS_PUBLIC_KEY } from '../../src/common/decorators/public.decorator';
import { PublicPoolController } from '../../src/modules/public-pool/public-pool.controller';
import { PoolService } from '../../src/modules/pool/pool.service';
import { RoundService } from '../../src/modules/round/round.service';
import { PickService } from '../../src/modules/pick/pick.service';

describe('PublicPoolController', () => {
  let controller: PublicPoolController;
  let poolService: {
    findPublicPoolOrThrow: jest.Mock;
    getPublicPoolSummary: jest.Mock;
  };
  let roundService: { getAllRounds: jest.Mock };
  let pickService: { getRoundStats: jest.Mock; getLeaderboard: jest.Mock };

  beforeEach(async () => {
    poolService = {
      findPublicPoolOrThrow: jest.fn().mockResolvedValue({ _id: 'p1' }),
      getPublicPoolSummary: jest.fn(),
    };
    roundService = { getAllRounds: jest.fn() };
    pickService = { getRoundStats: jest.fn(), getLeaderboard: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicPoolController],
      providers: [
        { provide: PoolService, useValue: poolService },
        { provide: RoundService, useValue: roundService },
        { provide: PickService, useValue: pickService },
      ],
    }).compile();

    controller = module.get(PublicPoolController);
  });

  it('is marked @Public() at class level so the global AuthGuard lets guests through', () => {
    const reflector = new Reflector();
    expect(reflector.get(IS_PUBLIC_KEY, PublicPoolController)).toBe(true);
  });

  it('does not expose a pick (write) endpoint', () => {
    const proto = PublicPoolController.prototype as unknown as Record<
      string,
      unknown
    >;
    expect(proto.pickTeam).toBeUndefined();
  });

  describe('getSummary', () => {
    it('returns the public pool summary', async () => {
      const summary = { id: 'p1', name: 'WC Pool' };
      poolService.getPublicPoolSummary.mockResolvedValue(summary);

      await expect(controller.getSummary('p1')).resolves.toBe(summary);
      expect(poolService.getPublicPoolSummary).toHaveBeenCalledWith('p1');
    });
  });

  describe('getRounds', () => {
    it('checks the pool exists, then returns all rounds', async () => {
      const rounds = [{ roundNumber: 1, matches: [] }];
      roundService.getAllRounds.mockResolvedValue(rounds);

      await expect(controller.getRounds('p1')).resolves.toBe(rounds);
      expect(poolService.findPublicPoolOrThrow).toHaveBeenCalledWith('p1');
      expect(roundService.getAllRounds).toHaveBeenCalledWith('p1');
    });

    it('propagates 404 and does not load rounds for an unknown pool', async () => {
      poolService.findPublicPoolOrThrow.mockRejectedValue(
        new NotFoundException('Pool not found'),
      );

      await expect(controller.getRounds('nope')).rejects.toThrow(
        NotFoundException,
      );
      expect(roundService.getAllRounds).not.toHaveBeenCalled();
    });
  });

  describe('getRoundStats', () => {
    it('calls getRoundStats in publicView mode without a user id', async () => {
      const stats = { roundNumber: 2, picksRevealed: false };
      pickService.getRoundStats.mockResolvedValue(stats);

      await expect(controller.getRoundStats('p1', 2)).resolves.toBe(stats);
      expect(poolService.findPublicPoolOrThrow).toHaveBeenCalledWith('p1');
      expect(pickService.getRoundStats).toHaveBeenCalledWith(
        'p1',
        2,
        undefined,
        { publicView: true },
      );
    });
  });

  describe('getLeaderboard', () => {
    it('calls getLeaderboard in publicView mode', async () => {
      const board = { entries: [], totalPlayers: 0 };
      pickService.getLeaderboard.mockResolvedValue(board);

      await expect(controller.getLeaderboard('p1')).resolves.toBe(board);
      expect(pickService.getLeaderboard).toHaveBeenCalledWith('p1', {
        publicView: true,
      });
    });

    it('propagates 404 for an unknown pool', async () => {
      poolService.findPublicPoolOrThrow.mockRejectedValue(
        new NotFoundException('Pool not found'),
      );

      await expect(controller.getLeaderboard('nope')).rejects.toThrow(
        NotFoundException,
      );
      expect(pickService.getLeaderboard).not.toHaveBeenCalled();
    });
  });
});
