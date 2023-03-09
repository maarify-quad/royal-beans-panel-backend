import { Controller, Get, Param, Query } from '@nestjs/common';

// Services
import { ExitService } from './exit.service';

// DTOs
import { GetExitsDTO } from './dto/get-exits.dto';

@Controller('exits')
export class ExitController {
  constructor(private readonly exitService: ExitService) {}

  @Get(':productId')
  async getExits(
    @Param('productId') productId: number,
    @Query() query: GetExitsDTO,
  ) {
    return await this.exitService.findByPagination(query, {
      where: { productId },
      withDeleted: true,
    });
  }
}
