import { Connection } from 'mongoose';
import { PoolParticipantSchema } from './schemas/pool-participant.schema';

export const POOL_PARTICIPANTS_MODEL = 'POOL_PARTICIPANTS_MODEL';

export const participantProviders = [
  {
    provide: POOL_PARTICIPANTS_MODEL,
    useFactory: (connection: Connection) =>
      connection.model('PoolParticipant', PoolParticipantSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
