import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

/* ----------------------------------------
 * POOL
 * ---------------------------------------- */
export interface Pool extends Document {
  name: string;
  description?: string;
  status: 'open' | 'active' | 'finished';
  createdBy: string;
  startedAt?: Date;
  finishedAt?: Date;
  tournamentKey?: string;
  /** Prize pool in EUR, set when pool is started (e.g. approved count × 40 when rake is on). */
  prizePoolEur?: number;
  /** House rake in EUR, set when pool is started with rake enabled. */
  rakeEur?: number;
  entryFeeEur?: number;
  rakePerEntryEur?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/* ----------------------------------------
 * POOL PARTICIPANT
 * ---------------------------------------- */
export interface PoolParticipant extends Document {
  poolId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'winner';
  joinedAt?: Date;
  approvedAt?: Date;
  eliminated?: boolean;
  eliminatedAt?: Date;
  eliminatedReason?: 'team_lost' | 'no_pick';
  winnerAt?: Date;
}

/* ----------------------------------------
 * MATCH
 * ---------------------------------------- */
export interface Match {
  homeTeam: string;
  awayTeam: string;
  winnerTeam?: string;
  isDraw?: boolean;
  homeGoals?: number;
  awayGoals?: number;
}

/* ----------------------------------------
 * PICK
 * ---------------------------------------- */
export interface Pick extends Document {
  userId: Types.ObjectId;
  poolId: Types.ObjectId;
  round: number;
  team: string;
  eliminated: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/* ----------------------------------------
 * ROUND
 * ---------------------------------------- */
export interface Round extends Document {
  poolId: string;
  roundNumber: number;
  matches: Match[];
  results?: string[];
  isClosed: boolean;
  /** Picks allowed only when now < pickDeadline. When absent, no time limit (legacy behavior). */
  pickDeadline?: Date;
}

/* ----------------------------------------
 * Request DTOs
 * ---------------------------------------- */

export class PickTeamDto {
  @ApiProperty({
    description:
      'Team name to pick for the current round (must be playing in the active round)',
  })
  @IsString()
  @IsNotEmpty()
  team: string;
}
