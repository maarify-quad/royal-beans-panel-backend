import { Controller, Get, Param, Query } from '@nestjs/common';

// Services
import { ProductionService } from './production.service';

// DTOs
import { GetProductionsDTO } from './dto/get-productions.dto';

@Controller('productions')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get('/product/:productId')
  async getProductionsByProductId(
    @Param('productId') productId: number,
    @Query() query: GetProductionsDTO,
  ) {
    return await this.productionService.findByPagination(query, {
      where: { productId },
      relations: {
        product: true,
        order: { customer: true },
        producedProduct: true,
      },
    });
  }
}
