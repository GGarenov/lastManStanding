import * as dns from 'dns';
import * as mongoose from 'mongoose';

function configureMongoDns(): void {
  const servers = process.env.MONGO_DNS_SERVERS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (servers?.length) {
    dns.setServers(servers);
  }
}

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<typeof mongoose> => {
      const uri = process.env.MONGO_URI;

      if (!uri) {
        throw new Error('MONGO_URI is not defined in environment variables');
      }

      configureMongoDns();

      return mongoose.connect(uri).then((conn) => {
        console.log('MongoDB connected');
        return conn;
      });
    },
  },
];
