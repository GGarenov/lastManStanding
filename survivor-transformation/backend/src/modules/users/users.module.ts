import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { usersProviders } from './users.providers';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [...usersProviders, UsersService],
  exports: [UsersService, ...usersProviders], // Export UsersService and USERS_MODEL for other modules
})
export class UsersModule {}
