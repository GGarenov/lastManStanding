import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      sub: string;
      role?: string;
      iat?: number;
      exp?: number;
    };
  }
}
