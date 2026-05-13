import { Connection } from 'mongoose';
import { PickSchema } from './schemas/pick.schema';

export const PICKS_MODEL = 'PICKS_MODEL';

export const pickProviders = [
  {
    provide: PICKS_MODEL,
    useFactory: (connection: Connection) =>
      connection.model('Pick', PickSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
