import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PoolService } from '../pool/pool.service';
import { RoundService } from '../round/round.service';
import { PickService } from '../pick/pick.service';
import { RoundStatsDto } from '../pick/pick.interface';

/**
 * Read-only "spectator" endpoints: no login and no pool membership required.
 * Member endpoints under `pools/:poolId/survivor/...` stay unchanged.
 *
 * Privacy rules:
 * - Usernames are never derived from email addresses (`publicView`).
 * - Picked teams stay hidden until the round is closed or its pick deadline passes
 *   (same rule as the member stats endpoint).
 */
@Public()
@ApiTags('public')
@ApiParam({ name: 'poolId', description: 'Pool ID' })
@ApiNotFoundResponse({ description: 'Pool not found' })
@Controller('pools/:poolId/public')
export class PublicPoolController {
  constructor(
    private readonly poolService: PoolService,
    private readonly roundService: RoundService,
    private readonly pickService: PickService,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Public pool summary',
    description:
      'Name, status, tournament, players remaining and prize pool. No per-user fields.',
  })
  getSummary(@Param('poolId') poolId: string) {
    return this.poolService.getPublicPoolSummary(poolId);
  }

  @Get('rounds')
  @ApiOperation({
    summary: 'Public rounds',
    description:
      'All rounds with matches (team vs team), deadlines and results.',
  })
  async getRounds(@Param('poolId') poolId: string) {
    await this.poolService.findPublicPoolOrThrow(poolId);
    return this.roundService.getAllRounds(poolId);
  }

  @Get('stats/:roundNumber')
  @ApiOperation({
    summary: 'Public round pick statistics',
    description:
      'Who has picked and how many are still deciding. Team identities are hidden until the round is closed or its pick deadline has passed.',
  })
  @ApiParam({ name: 'roundNumber', description: 'Round number', type: Number })
  @ApiOkResponse({ type: RoundStatsDto })
  async getRoundStats(
    @Param('poolId') poolId: string,
    @Param('roundNumber', ParseIntPipe) roundNumber: number,
  ) {
    await this.poolService.findPublicPoolOrThrow(poolId);
    return this.pickService.getRoundStats(poolId, roundNumber, undefined, {
      publicView: true,
    });
  }

  @Get('leaderboard')
  @ApiOperation({
    summary: 'Public leaderboard',
    description: 'Players, rounds survived, last pick and elimination status.',
  })
  async getLeaderboard(@Param('poolId') poolId: string) {
    await this.poolService.findPublicPoolOrThrow(poolId);
    return this.pickService.getLeaderboard(poolId, { publicView: true });
  }
}
