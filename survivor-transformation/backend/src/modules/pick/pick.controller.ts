import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { PickService } from './pick.service';
import { PickTeamDto } from './pick.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('pools')
@Controller('pools/:poolId/survivor')
export class PickController {
  constructor(private readonly pickService: PickService) {}

  @Post('pick')
  @ApiBody({ type: PickTeamDto })
  pickTeam(
    @Param('poolId') poolId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: PickTeamDto,
  ) {
    return this.pickService.pickTeam(poolId, userId, dto);
  }

  @Get('me')
  getMyStatus(
    @Param('poolId') poolId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.pickService.getUserStatus(poolId, userId);
  }

  @Get('status')
  getAllUsersStatus(@Param('poolId') poolId: string) {
    return this.pickService.getAllUsersStatus(poolId);
  }

  @Get('stats/:roundNumber')
  getRoundStats(
    @Param('poolId') poolId: string,
    @Param('roundNumber', ParseIntPipe) roundNumber: number,
  ) {
    return this.pickService.getRoundStats(poolId, roundNumber);
  }

  @Get('leaderboard')
  getLeaderboard(@Param('poolId') poolId: string) {
    return this.pickService.getLeaderboard(poolId);
  }
}
