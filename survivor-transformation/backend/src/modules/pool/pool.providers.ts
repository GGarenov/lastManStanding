import { Connection } from 'mongoose';
import { PoolSchema } from './schemas/pool.schema';

export const POOLS_MODEL = 'POOLS_MODEL';

export const poolProviders = [
  {
    provide: POOLS_MODEL,
    useFactory: (connection: Connection) =>
      connection.model('Pool', PoolSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
