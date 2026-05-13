import { Document } from 'mongoose';

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
