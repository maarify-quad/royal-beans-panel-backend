import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Modules
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';

// Auth
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';

// Services
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token.service';

// Controllers
import { AuthController } from './auth.controller';

// Entities
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [
    {
      provide: 'JWT_SECRET',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return configService.get('JWT_SECRET');
      },
    },
    AuthService,
    RefreshTokenService,
    LocalStrategy,
    JwtStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
