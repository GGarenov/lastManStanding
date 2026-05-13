import { Body, Controller, Post, Res, Get, Req } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.interface';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiBody({ type: RegisterDto })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.username, dto.password);
  }

  @Public()
  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { token, user } = await this.authService.login(
      dto.email,
      dto.password,
    );

    res.setCookie('auth', token, {
      httpOnly: true,
      path: '/',
      // Use SameSite=None so cookies are sent on cross-site requests from dev frontend.
      // In production ensure `secure: true` and serve over HTTPS.
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
    });

    // return user and token so clients that can't send cookies (dev) can use Authorization header
    return { user, token };
  }

  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) res: FastifyReply) {
    res.clearCookie('auth', { path: '/' });
    return { ok: true };
  }

  @Get('me')
  async me(@Req() req: FastifyRequest) {
    // req.user contains JWT payload (sub, role), fetch full user from DB
    const userId = (req.user as any)?.sub;
    if (!userId) {
      return null;
    }
    const user = await this.authService.getUserById(userId);
    if (!user) {
      return null;
    }
    // Return user without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
}
