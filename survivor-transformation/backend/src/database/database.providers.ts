import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<typeof mongoose> => {
      const uri = process.env.MONGO_URI;

      if (!uri) {
        throw new Error('MONGO_URI is not defined in environment variables');
      }

      return mongoose.connect(uri).then((conn) => {
        console.log('MongoDB connected');
        return conn;
      });
    },
  },
];
