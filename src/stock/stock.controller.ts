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
    const user = req.user.user;
    const allowedRoles = ['admin', 'updateDailyStocks'];
    if (!user.roles.some((role) => allowedRoles.includes(role))) {
      throw new ForbiddenException('Bu işlem için yetkiniz bulunmamaktadır.');
    }

    await this.stockCronService.updateDailyStocks();

    return { success: true };
  }
}
