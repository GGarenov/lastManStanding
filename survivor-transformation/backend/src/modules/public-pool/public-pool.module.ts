import { Module } from '@nestjs/common';
import { PoolModule } from '../pool/pool.module';
import { RoundModule } from '../round/round.module';
import { PickModule } from '../pick/pick.module';
import { PublicPoolController } from './public-pool.controller';

@Module({
  imports: [PoolModule, RoundModule, PickModule],
  controllers: [PublicPoolController],
})
export class PublicPoolModule {}
