import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Request as IRequest, Response } from 'express';

// Services
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token.service';

// Guards
import { LocalAuthGuard } from './guards/local-auth.guard';

// DTOs
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
    @Body() _loginDto: LoginDto,
  ) {
    // Login the user, generate a JWT and refresh token
    const { accessToken, refreshToken } = await this.authService.login(
      req.user,
      true,
    );

    // Set the refresh token in the cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { accessToken, user: req.user };
  }

  @Get('refresh_token')
  async refreshToken(
    @Req() req: IRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Validate the refresh token in the request cookie
    const refreshToken = await this.refreshTokenService.isValidRefreshToken(
      req.cookies.refreshToken,
    );
    if (!refreshToken) {
      res.cookie('refreshToken', '', {
        maxAge: -1,
      });
      throw new UnauthorizedException();
    }

    // Login the user then generate a JWT
    const { accessToken } = await this.authService.login(
      refreshToken.user,
      false,
    );

    return { accessToken, user: refreshToken.user };
  }

  @Get('profile')
  async getProfile(@Request() req, @Res({ passthrough: true }) res: Response) {
    // Validate the refresh token in the request cookie
    const refreshToken = await this.refreshTokenService.isValidRefreshToken(
      req.cookies.refreshToken,
    );
    if (!refreshToken) {
      res.cookie('refreshToken', '', {
        maxAge: -1,
      });
      throw new UnauthorizedException();
    }

    // Login the user then generate a JWT
    const { accessToken } = await this.authService.login(
      refreshToken.user,
      false,
    );

    return { accessToken, user: refreshToken.user };
  }

  @Get('logout')
  async logout(
    @Req() req: IRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Logout user
    await this.authService.logout(req.cookies.refreshToken);

    // Clear cookies
    res.cookie('refreshToken', '', {
      maxAge: -1,
    });

    // Response
    return { success: true };
  }
}
