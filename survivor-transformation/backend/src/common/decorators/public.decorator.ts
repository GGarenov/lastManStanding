import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as public (no authentication required).
 * Used by the global AuthGuard to skip JWT verification for login, register, logout, etc.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
