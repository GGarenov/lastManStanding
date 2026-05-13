import { Module } from '@nestjs/common';
import { SurvivorService } from './survivor.service';
import { RoundModule } from '../round/round.module';
import { ParticipantModule } from '../participant/participant.module';
import { PoolModule } from '../pool/pool.module';
import { PickModule } from '../pick/pick.module';

@Module({
  imports: [RoundModule, ParticipantModule, PoolModule, PickModule],
  controllers: [],
  providers: [SurvivorService],
  exports: [SurvivorService],
})
export class SurvivorModule {}
