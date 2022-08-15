import { Body, Controller, Get, Param, Post } from '@nestjs/common';

// Services
import { PriceListProductService } from './price-list-product.service';

// DTOs
import { CreatePriceListProductDto } from './dto/create-price-list-product.dto';

@Controller('price_list_products')
export class PriceListProductController {
  constructor(
    private readonly priceListProductService: PriceListProductService,
  ) {}

  @Get(':priceListId')
  async getByPriceListId(@Param('priceListId') priceListId: number) {
    return this.priceListProductService.findByPriceListId(priceListId);
  }

  @Post()
  async create(@Body() priceListProduct: CreatePriceListProductDto) {
    return this.priceListProductService.create(priceListProduct);
  }
}
