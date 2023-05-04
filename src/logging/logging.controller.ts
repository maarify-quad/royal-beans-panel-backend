import {
  Controller,
  ForbiddenException,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

// Services
import { LoggingService } from './logging.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('logging')
@UseGuards(JwtAuthGuard)
export class LoggingController {
  constructor(private readonly loggingService: LoggingService) {}

  @Get()
  async getAll(@Req() req) {
    if (!req.user.user.roles.find((role) => role.name === 'admin')) {
      throw new ForbiddenException();
    }

    return await this.loggingService.findAll({
      order: {
        createdAt: 'DESC',
      },
      relations: {
        user: true,
        order: true,
        product: true,
      },
    });
  }
}
