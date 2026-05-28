import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    let cookieToken = request.cookies?.auth;

    if (!cookieToken && request.headers?.cookie) {
      const raw = request.headers.cookie as string;
      const match = raw
        .split(';')
        .map((s) => s.trim())
        .find((s) => s.startsWith('auth='));

      if (match) {
        cookieToken = match.split('=')[1];
      }
    }

    const authHeader = request.headers?.authorization as string | undefined;

    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : undefined;

    const token = cookieToken || bearerToken;

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
