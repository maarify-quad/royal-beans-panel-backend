import { Body, Controller, Post } from '@nestjs/common';

// Services
import { PriceListProductService } from './price-list-product.service';

// DTOs
import { CreatePriceListProductDto } from './dto/create-price-list-product.dto';

@Controller('price_list_products')
export class PriceListProductController {
  constructor(
    private readonly priceListProductService: PriceListProductService,
  ) {}

  @Post()
  async create(@Body() priceListProduct: CreatePriceListProductDto) {
    return this.priceListProductService.create(priceListProduct);
  }
}
