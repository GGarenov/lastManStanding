import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request || !request.user) return undefined;
    if (!data) return request.user;
    // allow requesting nested properties like 'sub'
    return request.user[data];
  },
);
