import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ParticipantService } from './participant.service';
import { RoundService } from '../round/round.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('pools')
@Controller('pools/:poolId/survivor')
export class ParticipantController {
  constructor(
    private readonly participantService: ParticipantService,
    private readonly roundService: RoundService,
  ) {}

  @Get('me/status')
  meStatus(
    @Param('poolId') poolId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.participantService.getParticipantStatus(poolId, userId);
  }

  /**
   * Participant-facing endpoint to read all rounds (and matches).
   * Guard: only approved participants can access.
   */
  @Get('rounds')
  async getRounds(
    @Param('poolId') poolId: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.participantService.ensureApproved(poolId, userId);
    return this.roundService.getAllRounds(poolId);
  }
}
