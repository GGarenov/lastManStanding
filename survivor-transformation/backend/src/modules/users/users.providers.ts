import { Connection } from 'mongoose';
import { UserSchema } from './schemas/user.schema';

export const USERS_MODEL = 'USERS_MODEL';

export const usersProviders = [
  {
    provide: USERS_MODEL,
    useFactory: (connection: Connection) =>
      connection.model('User', UserSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
