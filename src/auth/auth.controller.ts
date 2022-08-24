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
import { Request as IRequest, Response } from 'express';

// Services
import { AuthService } from './auth.service';

// Guards
import { LocalAuthGuard } from './guards/local-auth.guard';

// DTOs
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
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
      sameSite: 'lax',
    });

    return { accessToken, user: req.user };
  }

  @Get('refresh_token')
  async refreshToken(
    @Req() req: IRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Validate the refresh token in the request cookie
    const refreshToken = await this.authService.validateRefreshToken(req);

    // Login the user then generate a JWT and refresh token
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.login(refreshToken.user);

    // Set the refresh token in the response header
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { accessToken, user: refreshToken.user };
  }

  @Get('profile')
  async getProfile(@Request() req, @Res({ passthrough: true }) res: Response) {
    // Validate the refresh token in the request cookie
    const refreshToken = await this.authService.validateRefreshToken(req);

    // Login the user then generate a JWT and refresh token
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.login(refreshToken.user);

    // Set the refresh token in the response header
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { accessToken, user: refreshToken.user };
  }

  @Get('logout')
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    // Logout user
    await this.authService.logout(req);

    // Clear cookies
    res.cookie('refreshToken', '', {
      maxAge: -1,
    });

    // Response
    return { success: true };
  }
}
