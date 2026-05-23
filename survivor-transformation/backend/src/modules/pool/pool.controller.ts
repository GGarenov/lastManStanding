import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PoolService } from './pool.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('pools')
@Controller('pools')
export class PoolController {
  constructor(private readonly poolService: PoolService) {}

  @Get('survivor/me')
  getMyPoolMemberships(@CurrentUser('sub') userId: string) {
    return this.poolService.getMyPoolMemberships(userId);
  }

  /** Returns open/active pools with participant counts. */
  @Get('survivor')
  getOpenPools(@CurrentUser('sub') userId: string) {
    return this.poolService.getOpenPools(userId);
  }

  @Post(':poolId/join')
  joinPool(
    @Param('poolId') poolId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.poolService.joinPool(poolId, userId);
  }

  /** Returns my status for the pool. */
  @Get(':poolId/me')
  myStatus(
    @Param('poolId') poolId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.poolService.getMyStatus(poolId, userId);
  }
}
