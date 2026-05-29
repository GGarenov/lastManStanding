import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../src/modules/auth/auth.service';
import { UsersService } from '../../src/modules/users/users.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    jest.clearAllMocks();
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    } as any;
    configService = {
      get: jest.fn().mockReturnValue('test-jwt-secret'),
    } as any;
    service = new AuthService(usersService, configService);
  });

  describe('register', () => {
    it('hashes password and creates user, returns user without passwordHash', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      const created = {
        _id: 'user1',
        email: 'a@b.com',
        firstName: 'John',
        lastName: 'Doe',
        username: 'user1',
        passwordHash: 'hashed',
        role: 'user',
      };
      usersService.create.mockResolvedValue(created);

      const result = await service.register(
        'a@b.com',
        'John',
        'Doe',
        'user1',
        'password123',
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'a@b.com',
        firstName: 'John',
        lastName: 'Doe',
        username: 'user1',
        passwordHash: 'hashed',
      });
      expect(result).toBeDefined();
      expect((result as any).passwordHash).toBeUndefined();
      expect((result as any).email).toBe('a@b.com');
      expect((result as any).username).toBe('user1');
    });

    it('strips passwordHash when user has toObject (Mongoose doc)', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      const created = {
        _id: 'user1',
        email: 'a@b.com',
        username: 'user1',
        passwordHash: 'hashed',
        toObject() {
          return { ...this };
        },
      };
      usersService.create.mockResolvedValue(created);

      const result = await service.register(
        'a@b.com',
        'John',
        'Doe',
        'user1',
        'pass',
      );

      expect((result as any).passwordHash).toBeUndefined();
      expect((result as any).email).toBe('a@b.com');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('unknown@b.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when password does not match', async () => {
      const user = {
        _id: 'user1',
        email: 'a@b.com',
        passwordHash: 'hashed',
        role: 'user',
      };
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('a@b.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong', 'hashed');
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('returns token and user without passwordHash on success', async () => {
      const user = {
        _id: 'user1',
        email: 'a@b.com',
        passwordHash: 'hashed',
        role: 'user',
      };
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('signed-token');

      const result = await service.login('a@b.com', 'password');

      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed');
      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: 'user1', role: 'user' },
        'test-jwt-secret',
        { expiresIn: '7d' },
      );
      expect(result).toEqual({
        token: 'signed-token',
        user: expect.not.objectContaining({ passwordHash: expect.anything() }),
      });
      expect((result.user as any).passwordHash).toBeUndefined();
      expect((result.user as any).email).toBe('a@b.com');
    });

    it('strips passwordHash when user has toObject', async () => {
      const user = {
        _id: 'user1',
        email: 'a@b.com',
        passwordHash: 'secret',
        role: 'user',
        toObject() {
          return { _id: this._id, email: this.email, passwordHash: this.passwordHash, role: this.role };
        },
      };
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      const result = await service.login('a@b.com', 'pass');

      expect((result.user as any).passwordHash).toBeUndefined();
    });
  });

  describe('getUserById', () => {
    it('delegates to usersService.findById', async () => {
      const user = { _id: 'user1', email: 'a@b.com' };
      usersService.findById.mockResolvedValue(user);

      const result = await service.getUserById('user1');

      expect(usersService.findById).toHaveBeenCalledWith('user1');
      expect(result).toBe(user);
    });

    it('returns null when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      const result = await service.getUserById('missing');

      expect(result).toBeNull();
    });
  });
});
