import { Module, forwardRef } from '@nestjs/common';
import { RakeController } from './rake.controller';
import { RakeService } from './rake.service';
import { PoolModule } from '../pool/pool.module';

/**
 * Rake (house fee) module. Holds constants, RakeService, and admin rake summary endpoint.
 * Additive: AdminService and PoolService stay unchanged until rake is turned on.
 */
@Module({
  imports: [forwardRef(() => PoolModule)],
  controllers: [RakeController],
  providers: [RakeService],
  exports: [RakeService],
})
export class RakeModule {}
