import { Controller, Get, Param, Query } from '@nestjs/common';

// Services
import { PriceListService } from './price-list.service';

// DTOs
import { GetPriceListsDto } from './dto/get-price-lists.dto';

@Controller('price_lists')
export class PriceListController {
  constructor(private readonly priceListService: PriceListService) {}

  @Get()
  async getPriceLists(@Query() query?: GetPriceListsDto) {
    // If no query is provided, return all price lists
    if (!query) {
      const priceLists = await this.priceListService.findAll();
      return { priceLists };
    }

    // Parse query params
    const limit = parseInt(query.limit, 10) || 50;
    const page = parseInt(query.page, 10) || 1;

    // If query is provided, return price lists matching query
    const result = await this.priceListService.findAndCount({
      take: limit,
      skip: limit * (page - 1),
    });

    // Return price lists and total count
    const priceLists = result[0];
    const total: number = result[1];
    const totalPage = Math.ceil(total / limit);

    // End response
    return { priceLists, totalPage };
  }

  @Get(':id')
  async getPriceListById(@Param('id') id: string) {
    return await this.priceListService.findOneById(parseInt(id));
  }
}
