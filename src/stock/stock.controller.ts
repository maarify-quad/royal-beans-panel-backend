import {
  Controller,
  ForbiddenException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

// Services
import { StockCronService } from './stock.cron.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockCronService: StockCronService) {}

  @Post('update-daily-stocks')
  async updateDailyStocks(@Req() req) {
    if (!req.user.user.roles.find((role) => role.name === 'admin')) {
      throw new ForbiddenException();
    }

    await this.stockCronService.updateDailyStocks();

    return { success: true };
  }
}
