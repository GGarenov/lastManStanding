import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ParticipantModule } from '../participant/participant.module';
import { RakeModule } from '../rake/rake.module';
import { PoolService } from './pool.service';
import { PoolController } from './pool.controller';
import { POOLS_MODEL, poolProviders } from './pool.providers';

@Module({
  imports: [DatabaseModule, ParticipantModule, forwardRef(() => RakeModule)],
  controllers: [PoolController],
  providers: [PoolService, ...poolProviders],
  exports: [POOLS_MODEL, PoolService],
})
export class PoolModule {}
