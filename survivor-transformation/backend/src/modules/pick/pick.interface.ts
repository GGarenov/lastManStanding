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
