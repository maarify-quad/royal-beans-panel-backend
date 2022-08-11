import { Controller, Get } from '@nestjs/common';
import { PriceListService } from './price-list.service';

@Controller('price_lists')
export class PriceListController {
  constructor(private readonly priceListService: PriceListService) {}

  @Get()
  async getPriceLists() {
    const priceLists = await this.priceListService.findAll();
    return { priceLists };
  }
}
