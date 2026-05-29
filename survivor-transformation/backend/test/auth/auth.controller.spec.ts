import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockReply = () => {
    const res = {
      setCookie: jest.fn(),
      clearCookie: jest.fn(),
    };
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            getUserById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  describe('register', () => {
    it('calls authService.register with dto email, username, password', async () => {
      const dto = {
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        username: 'myuser',
        password: 'secret123',
      };
      const created = {
        id: '1',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        username: dto.username,
      };
      authService.register.mockResolvedValue(created as any);

      const result = await controller.register(dto as any);

      expect(authService.register).toHaveBeenCalledWith(
        dto.email,
        dto.firstName,
        dto.lastName,
        dto.username,
        dto.password,
      );
      expect(result).toEqual(created);
    });
  });

  describe('login', () => {
    it('calls authService.login, sets cookie and returns user and token', async () => {
      const dto = { email: 'a@b.com', password: 'pass' };
      const loginResult = {
        token: 'jwt-token',
        user: { id: '1', email: dto.email },
      };
      authService.login.mockResolvedValue(loginResult as any);
      const res = mockReply();

      const result = await controller.login(dto as any, res as any);

      expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
      expect(res.setCookie).toHaveBeenCalledWith(
        'auth',
        'jwt-token',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
          sameSite: 'none',
        }),
      );
      expect(result).toEqual({ user: loginResult.user, token: loginResult.token });
    });
  });

  describe('logout', () => {
    it('clears auth cookie and returns ok', () => {
      const res = mockReply();

      const result = controller.logout(res as any);

      expect(res.clearCookie).toHaveBeenCalledWith('auth', { path: '/' });
      expect(result).toEqual({ ok: true });
    });
  });

  describe('me', () => {
    it('returns user without passwordHash when req.user.sub is set', async () => {
      const req = { user: { sub: 'user1' } } as any;
      const dbUser = {
        toObject: () => ({
          _id: 'user1',
          email: 'a@b.com',
          passwordHash: 'secret',
        }),
      };
      authService.getUserById.mockResolvedValue(dbUser as any);

      const result = await controller.me(req);

      expect(authService.getUserById).toHaveBeenCalledWith('user1');
      expect(result).toBeDefined();
      expect((result as any).passwordHash).toBeUndefined();
      expect((result as any).email).toBe('a@b.com');
    });

    it('returns null when req.user.sub is missing', async () => {
      const req = { user: {} } as any;

      const result = await controller.me(req);

      expect(authService.getUserById).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('returns null when req.user is missing', async () => {
      const req = {} as any;

      const result = await controller.me(req);

      expect(authService.getUserById).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('returns null when getUserById returns null', async () => {
      const req = { user: { sub: 'missing' } } as any;
      authService.getUserById.mockResolvedValue(null);

      const result = await controller.me(req);

      expect(authService.getUserById).toHaveBeenCalledWith('missing');
      expect(result).toBeNull();
    });
  });
});
