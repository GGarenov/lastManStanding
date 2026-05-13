import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { RoundModule } from '../round/round.module';
import { ParticipantService } from './participant.service';
import { ParticipantController } from './participant.controller';
import {
  POOL_PARTICIPANTS_MODEL,
  participantProviders,
} from './participant.providers';

@Module({
  imports: [DatabaseModule, RoundModule],
  controllers: [ParticipantController],
  providers: [ParticipantService, ...participantProviders],
  exports: [POOL_PARTICIPANTS_MODEL, ParticipantService],
})
export class ParticipantModule {}
