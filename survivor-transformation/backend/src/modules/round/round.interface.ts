import { Document } from 'mongoose';

export interface Match {
  homeTeam: string;
  awayTeam: string;
  winnerTeam?: string;
  isDraw?: boolean;
  homeGoals?: number;
  awayGoals?: number;
}

export interface Round extends Document {
  poolId: string;
  roundNumber: number;
  matches: Match[];
  results?: string[];
  isClosed: boolean;
  /** Picks allowed only when now < pickDeadline. When absent, no time limit (legacy behavior). */
  pickDeadline?: Date;
}
