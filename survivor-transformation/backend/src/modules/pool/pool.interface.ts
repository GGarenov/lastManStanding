import { Document } from 'mongoose';

export interface Pool extends Document {
  name: string;
  description?: string;
  status: 'open' | 'active' | 'finished';
  createdBy: string;
  startedAt?: Date;
  finishedAt?: Date;
  tournamentKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
