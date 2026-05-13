import { Test, TestingModule } from '@nestjs/testing';
import { PoolController } from '../../src/modules/pool/pool.controller';
import { PoolService } from '../../src/modules/pool/pool.service';

describe('PoolController', () => {
  let controller: PoolController;
  let poolService: jest.Mocked<PoolService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoolController],
      providers: [
        {
          provide: PoolService,
          useValue: {
            getMyPoolMemberships: jest.fn(),
            getOpenPools: jest.fn(),
            joinPool: jest.fn(),
            getMyStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PoolController>(PoolController);
    poolService = module.get(PoolService) as jest.Mocked<PoolService>;
  });

  describe('getMyPoolMemberships', () => {
    it('calls getMyPoolMemberships with userId', async () => {
      const memberships = [{ poolId: 'p1', poolName: 'Pool 1', status: 'approved' }];
      poolService.getMyPoolMemberships.mockResolvedValue(memberships as any);

      const result = await controller.getMyPoolMemberships('user1');

      expect(poolService.getMyPoolMemberships).toHaveBeenCalledWith('user1');
      expect(result).toEqual(memberships);
    });
  });

  describe('getOpenPools', () => {
    it('calls getOpenPools with userId', async () => {
      const pools = [{ id: 'p1', name: 'Open Pool', status: 'open' }];
      poolService.getOpenPools.mockResolvedValue(pools as any);

      const result = await controller.getOpenPools('user1');

      expect(poolService.getOpenPools).toHaveBeenCalledWith('user1');
      expect(result).toEqual(pools);
    });
  });

  describe('joinPool', () => {
    it('calls joinPool with poolId and userId', async () => {
      const created = { poolId: 'p1', userId: 'user1', status: 'pending' };
      poolService.joinPool.mockResolvedValue(created as any);

      const result = await controller.joinPool('p1', 'user1');

      expect(poolService.joinPool).toHaveBeenCalledWith('p1', 'user1');
      expect(result).toEqual(created);
    });
  });

  describe('myStatus', () => {
    it('calls getMyStatus with poolId and userId', async () => {
      const status = { status: 'approved', eliminated: false, name: 'Pool' };
      poolService.getMyStatus.mockResolvedValue(status as any);

      const result = await controller.myStatus('p1', 'user1');

      expect(poolService.getMyStatus).toHaveBeenCalledWith('p1', 'user1');
      expect(result).toEqual(status);
    });
  });
});
