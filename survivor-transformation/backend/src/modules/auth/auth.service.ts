import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async register(
    email: string,
    firstName: string,
    lastName: string,
    username: string,
    password: string,
  ) {
    const normalizedEmail = email.trim();
    const normalizedUsername = username.trim();

    if (await this.usersService.findByUsername(normalizedUsername)) {
      throw new ConflictException('Username is already taken');
    }
    if (await this.usersService.findByEmail(normalizedEmail)) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email: normalizedEmail,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: normalizedUsername,
      passwordHash,
    });
    // Return user without passwordHash (handle both Mongoose document and plain object)
    const doc = Array.isArray(user) ? user[0] : user;
    const obj =
      doc &&
      typeof (doc as { toObject?: () => Record<string, unknown> }).toObject ===
        'function'
        ? (doc as { toObject: () => Record<string, unknown> }).toObject()
        : (doc as Record<string, unknown>) || {};
    const { passwordHash: _, ...userWithoutPassword } = obj;
    return userWithoutPassword;
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException();

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException();

    const token = jwt.sign(
      { sub: user._id, role: user.role },
      this.configService.get('JWT_SECRET'),
      { expiresIn: '7d' },
    );

    // Return user without passwordHash (handle both Mongoose document and plain object)
    const obj =
      user &&
      typeof (user as { toObject?: () => Record<string, unknown> }).toObject ===
        'function'
        ? (user as { toObject: () => Record<string, unknown> }).toObject()
        : (user as Record<string, unknown>) || {};
    const { passwordHash: _, ...userWithoutPassword } = obj;
    return { token, user: userWithoutPassword };
  }

  async getUserById(userId: string) {
    return this.usersService.findById(userId);
  }
}
