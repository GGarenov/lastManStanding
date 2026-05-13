import { Connection } from 'mongoose';
import { RoundSchema } from './schemas/round.schema';

export const ROUNDS_MODEL = 'ROUNDS_MODEL';

export const roundProviders = [
  {
    provide: ROUNDS_MODEL,
    useFactory: (connection: Connection) =>
      connection.model('Round', RoundSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
