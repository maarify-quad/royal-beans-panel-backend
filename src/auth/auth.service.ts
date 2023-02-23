import { Injectable, UnauthorizedException } from '@nestjs/common';

// Utils
import { compare } from 'bcryptjs';
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

  async validateUser(username: string, pass: string) {
    const user = await this.userService.findOneByUsername(username);
    const isValid = user ? await compare(pass, user.password) : false;
    if (isValid) {
      return user;
    }
    return null;
  }

  async login(user: User, withRefreshToken = true) {
    // Convert User instance to plain object for JWT payload
    const payload = instanceToPlain(user);

    if (withRefreshToken) {
      // Generate refresh token
      const refreshToken = await this.refreshTokenService.generateRefreshToken(
        user.id,
      );

      return {
        accessToken: this.jwtService.sign(payload),
        refreshToken,
      };
    }

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async logout(refreshToken: string) {
    const refreshTokenEntity = await this.refreshTokenService.findOne(
      refreshToken,
    );
    if (!refreshTokenEntity) {
      throw new UnauthorizedException();
    }
    await this.refreshTokenService.delete(refreshToken);
  }
}
