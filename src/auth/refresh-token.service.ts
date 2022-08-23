import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async findOne(refreshToken: string): Promise<RefreshToken> {
    return this.refreshTokenRepository.findOne({
      where: { refreshToken },
      relations: { user: true },
    });
  }

  async findOneByUserId(userId: number): Promise<RefreshToken> {
    return this.refreshTokenRepository.findOne({
      where: { userId },
      relations: { user: true },
    });
  }

  async create(refreshToken: string, userId: number): Promise<RefreshToken> {
    return this.refreshTokenRepository.save({ refreshToken, userId });
  }

  async update(refreshToken: string, userId: number): Promise<any> {
    return this.refreshTokenRepository.update({ userId }, { refreshToken });
  }

  async delete(refreshToken: string): Promise<any> {
    return this.refreshTokenRepository.delete({ refreshToken });
  }
}
