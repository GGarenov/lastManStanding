import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../guards';
import {
  AddRoundDto,
  ApproveParticipantDto,
  CreatePoolDto,
  RecordRoundResultsDto,
  UpdateParticipantDto,
  UpdatePoolDto,
  UpdateRoundDto,
} from './admin.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('admin')
@UseGuards(RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('admin')
  @Post('pool')
  @ApiBody({ type: CreatePoolDto })
  createPool(@Body() dto: CreatePoolDto, @CurrentUser('sub') userId: string) {
    return this.adminService.createPool({ ...dto, createdBy: userId } as any);
  }

  @Roles('admin')
  @Patch('pool/:poolId')
  @ApiBody({ type: UpdatePoolDto })
  updatePool(@Param('poolId') poolId: string, @Body() dto: UpdatePoolDto) {
    return this.adminService.updatePool(poolId, dto);
  }

  @Roles('admin')
  @Delete('pool/:poolId')
  deletePool(@Param('poolId') poolId: string) {
    return this.adminService.deletePool(poolId);
  }

  @Roles('admin')
  @Post('pool/:poolId/start')
  startPool(@Param('poolId') poolId: string) {
    return this.adminService.startPool(poolId);
  }

  @Roles('admin')
  @Get('pools')
  getPools() {
    return this.adminService.getPools();
  }

  @Roles('admin')
  @Patch('participant/:participantId/approve')
  @ApiBody({ type: ApproveParticipantDto })
  approveParticipant(
    @Param('participantId') participantId: string,
    @Body() dto: ApproveParticipantDto,
  ) {
    return this.adminService.approveParticipant(participantId, dto);
  }

  @Roles('admin')
  @Patch('participant/:participantId')
  @ApiBody({ type: UpdateParticipantDto })
  updateParticipant(
    @Param('participantId') participantId: string,
    @Body() dto: UpdateParticipantDto,
  ) {
    return this.adminService.updateParticipant(participantId, dto);
  }

  @Roles('admin')
  @Delete('participant/:participantId')
  deleteParticipant(@Param('participantId') participantId: string) {
    return this.adminService.deleteParticipant(participantId);
  }

  @Roles('admin')
  @Get('pool/:poolId/participants')
  getParticipants(@Param('poolId') poolId: string) {
    return this.adminService.getParticipants(poolId);
  }

  @Roles('admin')
  @Get('pool/:poolId/rounds')
  getRounds(@Param('poolId') poolId: string) {
    return this.adminService.getRounds(poolId);
  }

  @Roles('admin')
  @Post('pool/:poolId/round')
  @ApiBody({ type: AddRoundDto })
  addRound(@Param('poolId') poolId: string, @Body() dto: AddRoundDto) {
    return this.adminService.addRound(poolId, dto);
  }

  @Roles('admin')
  @Patch('pool/:poolId/round/:roundNumber')
  @ApiBody({ type: UpdateRoundDto })
  updateRound(
    @Param('poolId') poolId: string,
    @Param('roundNumber') roundNumber: number,
    @Body() dto: UpdateRoundDto,
  ) {
    return this.adminService.updateRound(poolId, roundNumber, dto);
  }

  @Roles('admin')
  @Delete('pool/:poolId/round/:roundNumber')
  deleteRound(
    @Param('poolId') poolId: string,
    @Param('roundNumber') roundNumber: number,
  ) {
    return this.adminService.deleteRound(poolId, roundNumber);
  }

  @Roles('admin')
  @Post('pool/:poolId/round/:roundNumber/results')
  @ApiBody({ type: RecordRoundResultsDto })
  recordRoundResults(
    @Param('poolId') poolId: string,
    @Param('roundNumber', ParseIntPipe) roundNumber: number,
    @Body() dto: RecordRoundResultsDto,
  ) {
    return this.adminService.recordRoundResults(
      poolId,
      roundNumber,
      dto.results,
    );
  }

  @Roles('admin')
  @Delete('user/:userId')
  deleteUser(@Param('userId') userId: string) {
    return this.adminService.deleteUser(userId);
  }
}
