import { Injectable, UnauthorizedException } from '@nestjs/common';

// Utils
import { compareSync } from 'bcryptjs';
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

  async validateUser(username: string, password: string) {
    const user = await this.userService.findOneByUsername(username);
    const isPasswordMatch = user ? compareSync(password, user.password) : false;
    if (user && isPasswordMatch) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    // Convert User instance to plain object for JWT payload
    const payload = instanceToPlain(user);

    // Generate refresh token
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
    );

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken,
    };
  }

  async logout(userId: number) {
    const refreshToken = await this.refreshTokenService.findOneByUserId(userId);
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    await this.refreshTokenService.deleteByUserId(userId);
  }
}
