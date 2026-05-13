// src/modules/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RoundModule } from '../round/round.module';
import { ParticipantModule } from '../participant/participant.module';
import { PoolModule } from '../pool/pool.module';
import { PickModule } from '../pick/pick.module';
import { RakeModule } from '../rake/rake.module';
import { SurvivorModule } from '../survivor/survivor.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [RoundModule, ParticipantModule, PoolModule, PickModule, RakeModule, SurvivorModule, UsersModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
