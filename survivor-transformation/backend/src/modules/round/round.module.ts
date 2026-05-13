import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { RoundService } from './round.service';
import { ROUNDS_MODEL, roundProviders } from './round.providers';

@Module({
  imports: [DatabaseModule],
  providers: [RoundService, ...roundProviders],
  exports: [ROUNDS_MODEL, RoundService],
})
export class RoundModule {}
