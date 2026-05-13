import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantController } from '../../src/modules/participant/participant.controller';
import { ParticipantService } from '../../src/modules/participant/participant.service';
import { RoundService } from '../../src/modules/round/round.service';

describe('ParticipantController', () => {
  let controller: ParticipantController;
  let participantService: jest.Mocked<ParticipantService>;
  let roundService: jest.Mocked<RoundService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantController],
      providers: [
        {
          provide: ParticipantService,
          useValue: {
            getParticipantStatus: jest.fn(),
            ensureApproved: jest.fn(),
          },
        },
        {
          provide: RoundService,
          useValue: {
            getAllRounds: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ParticipantController>(ParticipantController);
    participantService = module.get(ParticipantService) as jest.Mocked<ParticipantService>;
    roundService = module.get(RoundService) as jest.Mocked<RoundService>;
  });

  describe('meStatus', () => {
    it('calls getParticipantStatus with poolId and userId', async () => {
      const status = { status: 'approved', eliminated: false };
      participantService.getParticipantStatus.mockResolvedValue(status as any);

      const result = await controller.meStatus('pool1', 'user1');

      expect(participantService.getParticipantStatus).toHaveBeenCalledWith('pool1', 'user1');
      expect(result).toEqual(status);
    });
  });

  describe('getRounds', () => {
    it('ensures user is approved then returns all rounds', async () => {
      const rounds = [{ roundNumber: 1 }, { roundNumber: 2 }];
      participantService.ensureApproved.mockResolvedValue(undefined);
      roundService.getAllRounds.mockResolvedValue(rounds as any);

      const result = await controller.getRounds('pool1', 'user1');

      expect(participantService.ensureApproved).toHaveBeenCalledWith('pool1', 'user1');
      expect(roundService.getAllRounds).toHaveBeenCalledWith('pool1');
      expect(result).toEqual(rounds);
    });

    it('ensureApproved throws so getAllRounds is not called', async () => {
      participantService.ensureApproved.mockRejectedValue(new Error('Not approved'));

      await expect(controller.getRounds('pool1', 'user1')).rejects.toThrow('Not approved');
      expect(roundService.getAllRounds).not.toHaveBeenCalled();
    });
  });
});
