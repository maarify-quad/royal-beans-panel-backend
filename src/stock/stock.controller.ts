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
    if (!user.roles.find((role) => role.name === 'updateDailyStocks')) {
      throw new ForbiddenException('Bu işlem için yetkiniz bulunmamaktadır.');
    }

    return { success: true };

    await this.stockCronService.updateDailyStocks();

    return { success: true };
  }
}
