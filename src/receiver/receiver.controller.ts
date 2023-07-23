import { Controller, Get, Query, UseGuards } from '@nestjs/common';

// Services
import { ReceiverService } from './receiver.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { GetReceiversDTO } from './dto/get-receivers.dto';

@Controller('receivers')
@UseGuards(JwtAuthGuard)
export class ReceiverController {
  constructor(private readonly receiverService: ReceiverService) {}

  @Get()
  async findAll(@Query() query: GetReceiversDTO) {
    return await this.receiverService.findByPagination(query);
  }
}
