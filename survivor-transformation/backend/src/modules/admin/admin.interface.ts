import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/** ---------------- POOL ---------------- */
export interface AdminPool {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'finished';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/** ---------------- PARTICIPANT ---------------- */
export interface AdminParticipant {
  id: string;
  userId: string;
  poolId: string;
  status: 'pending' | 'approved' | 'rejected' | 'winner';
  joinedAt: Date;
  updatedAt: Date;
}

/** ---------------- ROUND ---------------- */
export interface AdminRound {
  id: string;
  poolId: string;
  roundNumber: number;
  matches: AdminMatch[];
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminMatch {
  homeTeam: string;
  awayTeam: string;
  winnerTeam?: string | null;
  isDraw: boolean;
}

/** ---------------- Request / Response DTOs ---------------- */

export class MatchDto {
  @ApiProperty({ description: 'Home team name (must match tournament config)' })
  @IsString()
  homeTeam: string;

  @ApiProperty({ description: 'Away team name (must match tournament config)' })
  @IsString()
  awayTeam: string;
}

export class CreatePoolDto {
  @ApiProperty({
    description: 'Pool display name',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @Length(3, 50)
  name: string;

  @ApiPropertyOptional({
    description: 'Short description of the pool',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  description?: string;

  @ApiPropertyOptional({
    description:
      'ID of the admin creating the pool (set by backend if omitted)',
  })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional({
    description:
      'Tournament key linking to frontend config (e.g. euro-2024, world-cup-2026)',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  tournamentKey?: string;
}

export class UpdatePoolDto {
  @ApiPropertyOptional({
    description: 'Pool display name',
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(3, 50)
  name?: string;

  @ApiPropertyOptional({
    description: 'Short description of the pool',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  description?: string;

  @ApiPropertyOptional({
    description: 'Pool status',
    enum: ['open', 'active', 'finished'],
  })
  @IsOptional()
  @IsEnum(['open', 'active', 'finished'])
  status?: 'open' | 'active' | 'finished';

  @ApiPropertyOptional({
    description: 'Tournament key (e.g. euro-2024)',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  tournamentKey?: string;
}

export class AddRoundDto {
  @ApiProperty({ description: 'Round number (1-based)', minimum: 1 })
  @IsInt()
  @Min(1)
  roundNumber: number;

  @ApiProperty({
    description: 'Matches in this round (homeTeam vs awayTeam for each)',
    type: [MatchDto],
    default: [],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchDto)
  matches: MatchDto[] = [];

  @ApiPropertyOptional({
    description:
      'Deadline after which picks are no longer accepted for this round',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  pickDeadline?: Date;
}

export class UpdateRoundDto {
  @ApiPropertyOptional({
    description: 'Matches in this round (replaces existing if provided)',
    type: [MatchDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchDto)
  matches?: MatchDto[];

  @ApiPropertyOptional({ description: 'Pick deadline for this round' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  pickDeadline?: Date;
}

export class MatchResultDto {
  @ApiProperty({ description: 'Home team name (must match the match)' })
  @IsString()
  homeTeam: string;

  @ApiProperty({ description: 'Away team name (must match the match)' })
  @IsString()
  awayTeam: string;

  @ApiProperty({ description: 'Goals scored by home team', minimum: 0 })
  @Transform(({ value }) =>
    typeof value === 'number' ? value : parseInt(String(value), 10) || 0,
  )
  @IsNumber()
  @Min(0)
  homeGoals: number;

  @ApiProperty({ description: 'Goals scored by away team', minimum: 0 })
  @Transform(({ value }) =>
    typeof value === 'number' ? value : parseInt(String(value), 10) || 0,
  )
  @IsNumber()
  @Min(0)
  awayGoals: number;
}

export class RecordRoundResultsDto {
  @ApiProperty({
    description: 'Actual match results (scores) for each match in the round',
    type: [MatchResultDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MatchResultDto)
  results: MatchResultDto[];
}

/** Optional body for approve participant (no fields required). */
export class ApproveParticipantDto {}

export class UpdateParticipantDto {
  @ApiPropertyOptional({
    description: 'Participant status in the pool',
    enum: ['pending', 'approved', 'rejected', 'winner'],
  })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'winner'])
  status?: 'pending' | 'approved' | 'rejected' | 'winner';
}
