import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/modules/users/users.controller';
import { UsersService } from '../../src/modules/users/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
  });

  describe('findAll', () => {
    it('calls usersService.findAll and returns result', async () => {
      const users = [{ id: '1', email: 'a@b.com', username: 'alice' }];
      usersService.findAll.mockResolvedValue(users as any);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('me', () => {
    it('returns the user from CurrentUser decorator', () => {
      const user = { sub: 'u1', email: 'a@b.com', role: 'user' };

      const result = controller.me(user as any);

      expect(usersService.findAll).not.toHaveBeenCalled();
      expect(result).toBe(user);
    });
  });
});
