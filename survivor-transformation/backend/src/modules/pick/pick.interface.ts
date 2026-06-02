import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export interface Pick extends Document {
  userId: Types.ObjectId;
  poolId: Types.ObjectId;
  round: number;
  team: string;
  eliminated: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PickTeamDto {
  @ApiProperty({
    description:
      'Team name to pick for the current round (must be playing in the active round)',
  })
  @IsString()
  @IsNotEmpty()
  team: string;
}

/** Team pick count for round stats distribution chart. */
export class PickDistributionDto {
  @ApiProperty({
    description: 'Team name. Omitted from distribution when picks are hidden.',
    nullable: true,
    required: false,
  })
  team?: string | null;

  @ApiProperty({ description: 'Number of picks for this team' })
  count: number;

  @ApiProperty({ description: 'Share of picks in this round (0–100)' })
  percentage: number;
}

/** A participant pick row in round stats (recent / all picks lists). */
export class RoundStatsUserPickDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  username: string;

  @ApiProperty({
    description:
      'Team picked. Null when picksRevealed is false (active round before pick deadline).',
    nullable: true,
  })
  team: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}

/** Response for GET /pools/:poolId/survivor/stats/:roundNumber */
export class RoundStatsDto {
  @ApiProperty()
  roundNumber: number;

  @ApiProperty({ description: 'Participants who submitted a pick this round' })
  picksIn: number;

  @ApiProperty({
    description: 'Active participants who have not picked yet this round',
  })
  stillDeciding: number;

  @ApiProperty({
    description: 'Most picked team. Null when picks are hidden.',
    nullable: true,
  })
  trendingPick: string | null;

  @ApiProperty({ description: 'Distinct teams picked this round' })
  teamsPicked: number;

  @ApiProperty({
    type: [PickDistributionDto],
    description: 'Empty when picks are hidden.',
  })
  pickDistribution: PickDistributionDto[];

  @ApiProperty({ type: [RoundStatsUserPickDto] })
  recentPicks: RoundStatsUserPickDto[];

  @ApiProperty({ type: [RoundStatsUserPickDto] })
  allPicks: RoundStatsUserPickDto[];

  @ApiProperty({
    description:
      'True when the round is closed or when the pick deadline has passed.',
  })
  picksRevealed: boolean;

  @ApiProperty({
    description: 'Round pick deadline in ISO format. Null when no deadline is set.',
    nullable: true,
    required: false,
    type: String,
    format: 'date-time',
  })
  pickDeadline?: Date | null;

  @ApiProperty({
    description: 'Whether the round pick deadline has passed.',
  })
  pickDeadlinePassed: boolean;
}
