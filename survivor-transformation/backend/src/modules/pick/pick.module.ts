import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { UsersModule } from '../users/users.module';
import { PoolModule } from '../pool/pool.module';
import { ParticipantModule } from '../participant/participant.module';
import { RoundModule } from '../round/round.module';
import { PickService } from './pick.service';
import { PickController } from './pick.controller';
import { PICKS_MODEL, pickProviders } from './pick.providers';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    PoolModule,
    ParticipantModule,
    RoundModule,
  ],
  controllers: [PickController],
  providers: [PickService, ...pickProviders],
  exports: [PICKS_MODEL, PickService],
})
export class PickModule {}
