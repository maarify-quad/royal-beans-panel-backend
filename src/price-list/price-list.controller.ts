import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

// Services
import { PriceListService } from './price-list.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { GetPriceListsDto } from './dto/get-price-lists.dto';
import { CreatePriceListDto } from './dto/create-price-list.dto';

@Controller('price_lists')
@UseGuards(JwtAuthGuard)
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
      relations: {
        customers: true,
      },
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

  @Post()
  async createPriceList(@Body() createPriceListDto: CreatePriceListDto) {
    return await this.priceListService.create(createPriceListDto);
  }
}
