import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Services
import { RefreshTokenService } from '../refresh-token.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    if (!request.cookies.refreshToken) {
      throw new UnauthorizedException();
    }

    const validate = await this.refreshTokenService.validateRefreshToken(
      request.cookies.refreshToken,
    );

    if (!validate.user) {
      response.clearCookie('refreshToken');

      if (validate.error === 'EXPIRED_REFRESH_TOKEN') {
        throw new UnauthorizedException({
          message: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.',
          error: 'Unauthorized',
          statusCode: 401,
          code: 'EXPIRED_REFRESH_TOKEN',
        });
      }

      throw new UnauthorizedException();
    }

    request.user = validate.user;
    return true;
  }
}
