import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { PickService } from './pick.service';
import { PickTeamDto, RoundStatsDto } from './pick.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParticipantService } from '../participant/participant.service';

@ApiTags('pools')
@Controller('pools/:poolId/survivor')
export class PickController {
  constructor(
    private readonly pickService: PickService,
    private readonly participantService: ParticipantService,
  ) {}

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
  @ApiOperation({
    summary: 'Round pick statistics',
    description:
      'Returns community pick stats for an approved participant. Team identities are hidden until the viewer has picked for this round or the round is closed.',
  })
  @ApiParam({ name: 'poolId', description: 'Pool ID' })
  @ApiParam({ name: 'roundNumber', description: 'Round number', type: Number })
  @ApiOkResponse({ type: RoundStatsDto })
  async getRoundStats(
    @Param('poolId') poolId: string,
    @Param('roundNumber', ParseIntPipe) roundNumber: number,
    @CurrentUser('sub') userId: string,
  ) {
    await this.participantService.ensureApproved(poolId, userId);
    return this.pickService.getRoundStats(poolId, roundNumber, userId);
  }

  @Get('leaderboard')
  getLeaderboard(@Param('poolId') poolId: string) {
    return this.pickService.getLeaderboard(poolId);
  }
}
