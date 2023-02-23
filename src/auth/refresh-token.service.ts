import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateKeySync } from 'crypto';
import * as dayjs from 'dayjs';

// Entities
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async isValidRefreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const refreshTokenEntity = await this.findOne(refreshToken);
    if (!refreshTokenEntity) {
      throw new UnauthorizedException();
    }

    if (dayjs().isAfter(dayjs(refreshTokenEntity.expiresAt))) {
      await this.delete(refreshTokenEntity.refreshToken);
      throw new UnauthorizedException({
        status: 401,
        error: 'Unauthorized',
        code: 'SESSION_EXPIRED',
      });
    }

    return refreshTokenEntity;
  }
  async generateRefreshToken(userId: number) {
    // Generate refresh token
    const refreshToken = generateKeySync('hmac', { length: 64 })
      .export()
      .toString('hex');

    // Check if user already has a refresh token
    const existingRefreshToken = await this.findByUserId(userId);

    // If user already has a refresh token, update it
    if (existingRefreshToken) {
      await this.update(refreshToken, userId);
    } else {
      // Determine the expires at
      const expiresAt = dayjs().add(12, 'hour');

      // Create a new refresh token
      await this.create(refreshToken, userId, expiresAt.toDate());
    }

    return refreshToken;
  }

  async findOne(refreshToken: string) {
    return this.refreshTokenRepository.findOne({
      where: { refreshToken },
      relations: { user: true },
    });
  }

  async findByUserId(userId: number) {
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

  async update(refreshToken: string, userId: number): Promise<any> {
    return this.refreshTokenRepository.update({ userId }, { refreshToken });
  }

  async delete(refreshToken: string): Promise<any> {
    return this.refreshTokenRepository.delete({ refreshToken });
  }
}
