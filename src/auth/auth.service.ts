import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

// Utils
import { compare } from 'bcryptjs';
import { generateKeySync } from 'crypto';
import { instanceToPlain } from 'class-transformer';

// Services
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { RefreshTokenService } from './refresh-token.service';

// Entities
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByUsername(username);
    const isValid = user ? await compare(pass, user.password) : false;
    if (isValid) {
      return user;
    }
    return null;
  }

  async validateRefreshToken(req: Request): Promise<any> {
    const refreshTokenCookie = req.cookies.refreshToken;
    const refreshToken = await this.refreshTokenService.findOne(
      refreshTokenCookie,
    );
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    return refreshToken;
  }

  async login(user: User) {
    // Convert User instance to plain object for JWT payload
    const payload = instanceToPlain(user);

    // Generate refresh token
    const refreshToken = generateKeySync('hmac', { length: 64 })
      .export()
      .toString('hex');

    // Check if user already has a refresh token
    const existingRefreshToken = await this.refreshTokenService.findOneByUserId(
      user.id,
    );

    // If user already has a refresh token, update it
    if (existingRefreshToken) {
      await this.refreshTokenService.update(refreshToken, user.id);
    } else {
      // Create a new refresh token
      await this.refreshTokenService.create(refreshToken, user.id);
    }

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken,
    };
  }

  async logout(req: Request): Promise<any> {
    const refreshTokenCookie = req.cookies.refreshToken;
    const refreshToken = await this.refreshTokenService.findOne(
      refreshTokenCookie,
    );
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    await this.refreshTokenService.delete(refreshTokenCookie);
  }
}
