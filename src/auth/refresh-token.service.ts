import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import * as dayjs from 'dayjs';

// Entities
import { User } from 'src/user/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async validateRefreshToken(
    refreshTokenString: string,
  ): Promise<ValidateRefreshTokenResult> {
    const refreshToken = await this.findOneByRefreshToken(refreshTokenString);
    if (!refreshToken) {
      return { user: null, error: 'INVALID_REFRESH_TOKEN' };
    }
    if (dayjs(refreshToken.expiresAt).isBefore(dayjs())) {
      return { user: null, error: 'EXPIRED_REFRESH_TOKEN' };
    }
    return { user: refreshToken.user };
  }

  async generateRefreshToken(userId: number) {
    // Generate refresh token
    const refreshToken = randomBytes(32).toString('hex');

    // Check if user already has a refresh token
    const existingRefreshToken = await this.findOneByUserId(userId);

    // Set refresh token expiration date
    const expiresAt = dayjs().add(12, 'hours').toDate();

    // If user already has a refresh token, update it
    if (existingRefreshToken) {
      await this.update(refreshToken, userId, expiresAt);
    } else {
      // Create a new refresh token
      await this.create(refreshToken, userId, expiresAt);
    }

    return refreshToken;
  }

  async findOneByRefreshToken(refreshToken: string) {
    return this.refreshTokenRepository.findOne({
      where: { refreshToken },
      relations: { user: true },
    });
  }

  async findOneByUserId(userId: number) {
    return this.refreshTokenRepository.findOne({
      where: { userId },
      relations: { user: true },
    });
  }

  async create(refreshToken: string, userId: number, expiresAt: Date) {
    return this.refreshTokenRepository.save({
      refreshToken,
      userId,
      expiresAt,
    });
  }

  async update(refreshToken: string, userId: number, expiresAt: Date) {
    return this.refreshTokenRepository.update(
      { userId },
      { refreshToken, expiresAt },
    );
  }

  async deleteByUserId(userId: number) {
    return this.refreshTokenRepository.delete({ userId });
  }
}

type ValidateRefreshTokenResult =
  | { user: null; error: string }
  | {
      user: User;
      error?: undefined;
    };
