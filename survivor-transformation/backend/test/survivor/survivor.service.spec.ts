import { SurvivorService } from '../../src/modules/survivor/survivor.service';
import { RoundService } from '../../src/modules/round/round.service';
import { ParticipantService } from '../../src/modules/participant/participant.service';

describe('SurvivorService', () => {
  let service: SurvivorService;
  let roundService: { setRoundResults: jest.Mock; closeRound: jest.Mock };
  let participantService: {
    getAliveParticipants: jest.Mock;
    eliminate: jest.Mock;
    markWinners: jest.Mock;
  };
  let pickModel: { find: jest.Mock; exists: jest.Mock; distinct: jest.Mock };
  let poolModel: { findByIdAndUpdate: jest.Mock };

  beforeEach(() => {
    roundService = {
      setRoundResults: jest.fn(),
      closeRound: jest.fn().mockResolvedValue(undefined),
    };
    participantService = {
      getAliveParticipants: jest.fn(),
      eliminate: jest.fn().mockResolvedValue(undefined),
      markWinners: jest.fn().mockResolvedValue(undefined),
    };
    pickModel = {
      find: jest.fn(),
      exists: jest.fn(),
      distinct: jest.fn(),
    };
    poolModel = {
      findByIdAndUpdate: jest.fn().mockResolvedValue(undefined),
    };
    service = new SurvivorService(
      roundService as any,
      participantService as any,
      pickModel as any,
      poolModel as any,
    );
  });

  describe('recordRoundResults', () => {
    it('calls getAliveParticipants, setRoundResults, closeRound and returns resolved message', async () => {
      const round = {
        _id: 'round1',
        roundNumber: 1,
        matches: [{ homeTeam: 'A', awayTeam: 'B', winnerTeam: 'A' }],
      };
      participantService.getAliveParticipants
        .mockResolvedValueOnce([{ userId: 'u1' }, { userId: 'u2' }])
        .mockResolvedValueOnce([{ userId: 'u1' }])
        .mockResolvedValueOnce([{ userId: 'u1' }]);
      roundService.setRoundResults.mockResolvedValue(round);
      const pickWinner = { team: 'A', userId: 'u1', save: jest.fn().mockResolvedValue(undefined) };
      const pickLoser = { team: 'B', userId: 'u2', save: jest.fn().mockResolvedValue(undefined) };
      pickModel.find.mockResolvedValue([pickWinner, pickLoser]);
      pickModel.exists.mockResolvedValue(true);
      pickModel.distinct.mockResolvedValue(['u1', 'u2']);

      const result = await service.recordRoundResults('pool1', {
        roundNumber: 1,
        results: [
          { homeTeam: 'A', awayTeam: 'B', homeGoals: 2, awayGoals: 1 },
        ],
      });

      expect(participantService.getAliveParticipants).toHaveBeenCalledWith('pool1');
      expect(roundService.setRoundResults).toHaveBeenCalledWith('pool1', {
        roundNumber: 1,
        results: [{ homeTeam: 'A', awayTeam: 'B', homeGoals: 2, awayGoals: 1 }],
      });
      expect(roundService.closeRound).toHaveBeenCalledWith('round1');
      expect(result).toEqual({ message: 'Round 1 resolved' });
    });

    it('marks losing picks as eliminated and eliminates those participants (resolveRound)', async () => {
      const round = {
        _id: 'r1',
        roundNumber: 1,
        matches: [{ homeTeam: 'A', awayTeam: 'B', winnerTeam: 'A' }],
      };
      participantService.getAliveParticipants
        .mockResolvedValueOnce([{ userId: 'u1' }, { userId: 'u2' }])
        .mockResolvedValueOnce([{ userId: 'u1' }])
        .mockResolvedValueOnce([]);
      roundService.setRoundResults.mockResolvedValue(round);
      const pickWinner = { team: 'A', userId: 'u1', save: jest.fn().mockResolvedValue(undefined) };
      const pickLoser = { team: 'B', userId: 'u2', save: jest.fn().mockResolvedValue(undefined) };
      pickModel.find.mockResolvedValue([pickWinner, pickLoser]);
      pickModel.exists.mockResolvedValue(true);
      pickModel.distinct.mockResolvedValue(['u1', 'u2']);

      await service.recordRoundResults('pool1', {
        roundNumber: 1,
        results: [{ homeTeam: 'A', awayTeam: 'B', homeGoals: 2, awayGoals: 1 }],
      });

      expect(pickModel.find).toHaveBeenCalledWith({
        poolId: 'pool1',
        round: 1,
        eliminated: { $ne: true },
      });
      expect(pickLoser.eliminated).toBe(true);
      expect(pickLoser.save).toHaveBeenCalled();
      expect(participantService.eliminate).toHaveBeenCalledWith(
        'pool1',
        'u2',
        'team_lost',
      );
    });

    it('eliminates participants with no pick for the round (no_pick)', async () => {
      const round = {
        _id: 'r1',
        roundNumber: 1,
        matches: [{ homeTeam: 'A', awayTeam: 'B', winnerTeam: 'A' }],
      };
      participantService.getAliveParticipants
        .mockResolvedValueOnce([{ userId: 'u1' }])
        .mockResolvedValueOnce([{ userId: 'u1' }])
        .mockResolvedValueOnce([]);
      roundService.setRoundResults.mockResolvedValue(round);
      pickModel.find.mockResolvedValue([]);
      pickModel.exists.mockResolvedValue(false);
      pickModel.distinct.mockResolvedValue([]);

      await service.recordRoundResults('pool1', {
        roundNumber: 1,
        results: [{ homeTeam: 'A', awayTeam: 'B', homeGoals: 1, awayGoals: 0 }],
      });

      expect(participantService.eliminate).toHaveBeenCalledWith(
        'pool1',
        'u1',
        'no_pick',
      );
    });

    it('when everyone eliminated and some had pick (Scenario 1): marks those with pick as winners', async () => {
      const round = { _id: 'r1', roundNumber: 1, matches: [] };
      const aliveBefore = [{ userId: 'u1' }, { userId: 'u2' }];
      participantService.getAliveParticipants
        .mockResolvedValueOnce(aliveBefore)
        .mockResolvedValueOnce([{ userId: 'u1' }])
        .mockResolvedValueOnce([]);
      roundService.setRoundResults.mockResolvedValue(round);
      pickModel.find.mockResolvedValue([]);
      pickModel.exists.mockResolvedValue(true);
      pickModel.distinct.mockResolvedValue(['u1']);

      await service.recordRoundResults('pool1', {
        roundNumber: 1,
        results: [],
      });

      expect(participantService.markWinners).toHaveBeenCalledWith('pool1', ['u1']);
      expect(poolModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'pool1',
        expect.objectContaining({ status: 'finished', finishedAt: expect.any(Date) }),
      );
    });

    it('when everyone eliminated and nobody had pick (Scenario 2): marks all last survivors as winners', async () => {
      const round = { _id: 'r1', roundNumber: 1, matches: [] };
      const aliveBefore = [{ userId: 'u1' }, { userId: 'u2' }];
      participantService.getAliveParticipants
        .mockResolvedValueOnce(aliveBefore)
        .mockResolvedValueOnce(aliveBefore)
        .mockResolvedValueOnce([]);
      roundService.setRoundResults.mockResolvedValue(round);
      pickModel.find.mockResolvedValue([]);
      pickModel.exists.mockResolvedValue(false);
      participantService.eliminate.mockResolvedValue(undefined);
      pickModel.distinct.mockResolvedValue([]);

      await service.recordRoundResults('pool1', {
        roundNumber: 1,
        results: [],
      });

      expect(participantService.markWinners).toHaveBeenCalledWith(
        'pool1',
        expect.arrayContaining(['u1', 'u2']),
      );
      expect(poolModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'pool1',
        expect.objectContaining({ status: 'finished' }),
      );
    });

    it('when exactly one survivor: marks that participant as winner and finishes pool', async () => {
      const round = { _id: 'r1', roundNumber: 1, matches: [] };
      participantService.getAliveParticipants
        .mockResolvedValueOnce([{ userId: 'u1' }, { userId: 'u2' }])
        .mockResolvedValueOnce([{ userId: 'u1' }])
        .mockResolvedValueOnce([{ userId: 'u1' }]);
      roundService.setRoundResults.mockResolvedValue(round);
      pickModel.find.mockResolvedValue([]);
      pickModel.exists.mockResolvedValue(true);

      await service.recordRoundResults('pool1', {
        roundNumber: 1,
        results: [],
      });

      expect(participantService.markWinners).toHaveBeenCalledWith('pool1', ['u1']);
      expect(poolModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'pool1',
        expect.objectContaining({ status: 'finished' }),
      );
    });

    it('when multiple still alive: does not call markWinners or markPoolFinished', async () => {
      const round = { _id: 'r1', roundNumber: 1, matches: [] };
      participantService.getAliveParticipants
        .mockResolvedValueOnce([{ userId: 'u1' }, { userId: 'u2' }])
        .mockResolvedValueOnce([{ userId: 'u1' }, { userId: 'u2' }])
        .mockResolvedValueOnce([{ userId: 'u1' }, { userId: 'u2' }]);
      roundService.setRoundResults.mockResolvedValue(round);
      pickModel.find.mockResolvedValue([]);
      pickModel.exists.mockResolvedValue(true);

      await service.recordRoundResults('pool1', {
        roundNumber: 1,
        results: [],
      });

      expect(participantService.markWinners).not.toHaveBeenCalled();
      expect(poolModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });
});
