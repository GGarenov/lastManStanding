import { BadRequestException } from '@nestjs/common';
import { ParticipantService } from '../../src/modules/participant/participant.service';

type MockModel = {
  create: jest.Mock;
  findOne: jest.Mock;
  findOneAndUpdate: jest.Mock;
  updateMany: jest.Mock;
  find: jest.Mock;
};

const createMockModel = (): MockModel => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  updateMany: jest.fn(),
  find: jest.fn(),
});

describe('ParticipantService', () => {
  let service: ParticipantService;
  let participantModel: MockModel;

  beforeEach(() => {
    participantModel = createMockModel();
    service = new ParticipantService(participantModel as any);
  });

  describe('joinPool', () => {
    it('creates participant with poolId, userId and status pending', async () => {
      const created = { poolId: 'p1', userId: 'u1', status: 'pending' };
      participantModel.create.mockResolvedValue(created);

      const result = await service.joinPool('p1', 'u1');

      expect(participantModel.create).toHaveBeenCalledWith({
        poolId: 'p1',
        userId: 'u1',
        status: 'pending',
      });
      expect(result).toBe(created);
    });
  });

  describe('approve', () => {
    it('updates pending participant to approved with approvedAt', async () => {
      const updated = { poolId: 'p1', userId: 'u1', status: 'approved', approvedAt: new Date() };
      participantModel.findOneAndUpdate.mockResolvedValue(updated);

      const result = await service.approve('p1', 'u1');

      expect(participantModel.findOneAndUpdate).toHaveBeenCalledWith(
        { poolId: 'p1', userId: 'u1', status: 'pending' },
        expect.objectContaining({
          status: 'approved',
          approvedAt: expect.any(Date),
        }),
        { new: true },
      );
      expect(result).toBe(updated);
    });
  });

  describe('reject', () => {
    it('updates pending participant to rejected', async () => {
      const updated = { poolId: 'p1', userId: 'u1', status: 'rejected' };
      participantModel.findOneAndUpdate.mockResolvedValue(updated);

      const result = await service.reject('p1', 'u1');

      expect(participantModel.findOneAndUpdate).toHaveBeenCalledWith(
        { poolId: 'p1', userId: 'u1', status: 'pending' },
        { status: 'rejected' },
        { new: true },
      );
      expect(result).toBe(updated);
    });
  });

  describe('eliminate', () => {
    it('marks approved participant as eliminated with optional reason', async () => {
      const updated = { poolId: 'p1', userId: 'u1', eliminated: true, eliminatedAt: new Date(), eliminatedReason: 'team_lost' };
      participantModel.findOneAndUpdate.mockResolvedValue(updated);

      const result = await service.eliminate('p1', 'u1', 'team_lost');

      expect(participantModel.findOneAndUpdate).toHaveBeenCalledWith(
        { poolId: 'p1', userId: 'u1', status: 'approved' },
        expect.objectContaining({
          eliminated: true,
          eliminatedAt: expect.any(Date),
          eliminatedReason: 'team_lost',
        }),
      );
      expect(result).toBe(updated);
    });

    it('can eliminate without reason', async () => {
      participantModel.findOneAndUpdate.mockResolvedValue({});

      await service.eliminate('p1', 'u1');

      expect(participantModel.findOneAndUpdate).toHaveBeenCalledWith(
        { poolId: 'p1', userId: 'u1', status: 'approved' },
        expect.objectContaining({
          eliminated: true,
          eliminatedAt: expect.any(Date),
        }),
      );
      const payload = participantModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload).not.toHaveProperty('eliminatedReason');
    });
  });

  describe('markWinners', () => {
    it('updates many participants to winner and clears eliminated', async () => {
      participantModel.updateMany.mockResolvedValue({ modifiedCount: 2 });

      const result = await service.markWinners('p1', ['u1', 'u2']);

      expect(participantModel.updateMany).toHaveBeenCalledWith(
        { poolId: 'p1', userId: { $in: ['u1', 'u2'] } },
        expect.objectContaining({
          status: 'winner',
          winnerAt: expect.any(Date),
          eliminated: false,
        }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('getAliveParticipants', () => {
    it('finds approved non-eliminated participants', async () => {
      const list = [{ userId: 'u1' }, { userId: 'u2' }];
      participantModel.find.mockReturnValue(list);

      const result = await service.getAliveParticipants('p1');

      expect(participantModel.find).toHaveBeenCalledWith({
        poolId: 'p1',
        status: 'approved',
        eliminated: { $ne: true },
      });
      expect(result).toBe(list);
    });
  });

  describe('getParticipantStatus', () => {
    it('returns status none when no participant', async () => {
      participantModel.findOne.mockResolvedValue(null);

      const result = await service.getParticipantStatus('p1', 'u1');

      expect(participantModel.findOne).toHaveBeenCalledWith({ poolId: 'p1', userId: 'u1' });
      expect(result).toEqual({ status: 'none' });
    });

    it('returns status and eliminated when participant exists', async () => {
      participantModel.findOne.mockResolvedValue({
        status: 'approved',
        eliminated: false,
      });

      const result = await service.getParticipantStatus('p1', 'u1');

      expect(result).toEqual({ status: 'approved', eliminated: false });
    });

    it('returns eliminated true when participant is eliminated', async () => {
      participantModel.findOne.mockResolvedValue({
        status: 'approved',
        eliminated: true,
      });

      const result = await service.getParticipantStatus('p1', 'u1');

      expect(result).toEqual({ status: 'approved', eliminated: true });
    });
  });

  describe('ensureAlive', () => {
    it('throws when no participant', async () => {
      participantModel.findOne.mockResolvedValue(null);

      await expect(service.ensureAlive('p1', 'u1')).rejects.toThrow(BadRequestException);
      await expect(service.ensureAlive('p1', 'u1')).rejects.toThrow('Не участвате в този pool');
    });

    it('throws when participant status is not approved', async () => {
      participantModel.findOne.mockResolvedValue({ status: 'pending', eliminated: false });

      await expect(service.ensureAlive('p1', 'u1')).rejects.toThrow(BadRequestException);
      await expect(service.ensureAlive('p1', 'u1')).rejects.toThrow('Не участвате в този pool');
    });

    it('throws when participant is eliminated', async () => {
      participantModel.findOne.mockResolvedValue({ status: 'approved', eliminated: true });

      await expect(service.ensureAlive('p1', 'u1')).rejects.toThrow(BadRequestException);
      await expect(service.ensureAlive('p1', 'u1')).rejects.toThrow('Вече сте отпаднали от играта');
    });

    it('does not throw when approved and not eliminated', async () => {
      participantModel.findOne.mockResolvedValue({ status: 'approved', eliminated: false });

      await expect(service.ensureAlive('p1', 'u1')).resolves.toBeUndefined();
    });
  });

  describe('ensureApproved', () => {
    it('throws when no participant', async () => {
      participantModel.findOne.mockResolvedValue(null);

      await expect(service.ensureApproved('p1', 'u1')).rejects.toThrow(BadRequestException);
      await expect(service.ensureApproved('p1', 'u1')).rejects.toThrow('Не участвате в този pool');
    });

    it('throws when status is pending', async () => {
      participantModel.findOne.mockResolvedValue({ status: 'pending' });

      await expect(service.ensureApproved('p1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('throws when status is rejected', async () => {
      participantModel.findOne.mockResolvedValue({ status: 'rejected' });

      await expect(service.ensureApproved('p1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('does not throw when status is approved', async () => {
      participantModel.findOne.mockResolvedValue({ status: 'approved' });

      await expect(service.ensureApproved('p1', 'u1')).resolves.toBeUndefined();
    });

    it('does not throw when status is winner', async () => {
      participantModel.findOne.mockResolvedValue({ status: 'winner' });

      await expect(service.ensureApproved('p1', 'u1')).resolves.toBeUndefined();
    });
  });
});
