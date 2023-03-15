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
} from '@nestjs/common';
import { Response } from 'express';

// Services
import { AuthService } from './auth.service';

// Guards
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

// DTOs
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  async login(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
    @Body() _loginDto: LoginDto,
  ) {
    // Login the user then generate a JWT and refresh token
    const { accessToken, refreshToken } = await this.authService.login(
      req.user,
    );

    // Set the refresh token in the response header
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { accessToken, user: req.user };
  }

  @Get('refresh_token')
  @UseGuards(RefreshTokenGuard)
  async refreshToken(@Req() req, @Res({ passthrough: true }) res: Response) {
    // Login the user then generate a JWT and refresh token
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.login(req.user);

    // Set the refresh token in the response header
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { accessToken, user: req.user };
  }

  @Get('profile')
  @UseGuards(RefreshTokenGuard)
  async getProfile(@Request() req, @Res({ passthrough: true }) res: Response) {
    // Login the user then generate a JWT and refresh token
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.login(req.user);

    // Set the refresh token in the response header
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { accessToken, user: req.user };
  }

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    // Logout user
    await this.authService.logout(req.user.id);

    // Clear cookies
    res.cookie('refreshToken', '', {
      maxAge: -1,
    });

    // Response
    return { success: true };
  }
}
