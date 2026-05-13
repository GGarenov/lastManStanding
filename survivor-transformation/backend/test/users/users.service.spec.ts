import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../../src/modules/users/users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: {
    findOne: jest.Mock;
    findById: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    findByIdAndDelete: jest.Mock;
    countDocuments: jest.Mock;
  };

  beforeEach(() => {
    userModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
    };
    service = new UsersService(userModel as any);
  });

  describe('findByEmail', () => {
    it('calls findOne with email', async () => {
      const user = { _id: '1', email: 'a@b.com' };
      userModel.findOne.mockReturnValue(user);

      const result = await service.findByEmail('a@b.com');

      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'a@b.com' });
      expect(result).toBe(user);
    });
  });

  describe('findById', () => {
    it('calls findById with userId', async () => {
      const user = { _id: 'u1', email: 'a@b.com' };
      userModel.findById.mockResolvedValue(user);

      const result = await service.findById('u1');

      expect(userModel.findById).toHaveBeenCalledWith('u1');
      expect(result).toBe(user);
    });
  });

  describe('findAll', () => {
    it('calls find with select -passwordHash', async () => {
      const chain = { select: jest.fn().mockResolvedValue([{ _id: '1', email: 'a@b.com' }]) };
      userModel.find.mockReturnValue(chain);

      const result = await service.findAll();

      expect(userModel.find).toHaveBeenCalledWith();
      expect(chain.select).toHaveBeenCalledWith('-passwordHash');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ email: 'a@b.com' });
    });
  });

  describe('create', () => {
    it('calls create with data', async () => {
      const data = { email: 'a@b.com', username: 'user1', passwordHash: 'hash' };
      const created = { _id: '1', ...data };
      userModel.create.mockResolvedValue(created);

      const result = await service.create(data);

      expect(userModel.create).toHaveBeenCalledWith(data);
      expect(result).toBe(created);
    });
  });

  describe('deleteUser', () => {
    it('throws NotFoundException when user not found', async () => {
      userModel.findById.mockResolvedValue(null);

      await expect(service.deleteUser('missing')).rejects.toThrow(NotFoundException);
      await expect(service.deleteUser('missing')).rejects.toThrow('User not found');
      expect(userModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('deletes user when found', async () => {
      const user = { _id: 'u1' };
      userModel.findById.mockResolvedValue(user);
      userModel.findByIdAndDelete.mockResolvedValue(undefined);

      await service.deleteUser('u1');

      expect(userModel.findById).toHaveBeenCalledWith('u1');
      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('u1');
    });
  });

  describe('countAdmins', () => {
    it('returns count of documents with role admin', async () => {
      userModel.countDocuments.mockResolvedValue(2);

      const result = await service.countAdmins();

      expect(userModel.countDocuments).toHaveBeenCalledWith({ role: 'admin' });
      expect(result).toBe(2);
    });
  });
});
