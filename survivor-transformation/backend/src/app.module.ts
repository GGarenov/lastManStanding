import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import {
  AdminModule,
  AuthModule,
  ParticipantModule,
  PickModule,
  PoolModule,
  RakeModule,
  RoundModule,
  SurvivorModule,
  UsersModule,
} from './modules';
import { AuthGuard } from './guards';
import { GuardsModule } from './guards/guards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    GuardsModule,
    AuthModule,
    UsersModule,
    PoolModule,
    ParticipantModule,
    RoundModule,
    PickModule,
    SurvivorModule,
    AdminModule,
    RakeModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
