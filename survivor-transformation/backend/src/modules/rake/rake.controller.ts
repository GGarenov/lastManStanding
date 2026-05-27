import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { RakeService, HouseEarningsSummary } from './rake.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../guards';
import { POOLS_MODEL } from '../pool/pool.providers';
import { Pool } from '../pool/pool.interface';

@ApiTags('admin')
@UseGuards(RolesGuard)
@Controller('admin/rake')
export class RakeController {
  constructor(
    private readonly rakeService: RakeService,
    @Inject(POOLS_MODEL)
    private readonly poolModel: Model<Pool>,
  ) {}

  /**
   * Returns total house earnings (rake) and per-pool rake.
   * Pools without rakeEur (e.g. open or pre-rake) appear with rakeEur 0.
   */
  @Get('summary')
  @Roles('admin')
  async getSummary(): Promise<HouseEarningsSummary> {
    const pools = await this.poolModel.find().select('name rakeEur').lean();
    return this.rakeService.getHouseEarningsSummary(
      pools as { _id: unknown; name?: string; rakeEur?: number }[],
    );
  }
}
