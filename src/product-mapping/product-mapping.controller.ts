import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

// Services
import { ProductMappingService } from './product-mapping.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('product_mapping')
@UseGuards(JwtAuthGuard)
export class ProductMappingController {
  constructor(private readonly productMappingService: ProductMappingService) {}

  @Get('/shopify-products')
  async getShopifyProducts() {
    return await this.productMappingService.listShopifyProducts();
  }

  @Get('/parasut-products')
  async getParasutProducts(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return await this.productMappingService.searchParasutProducts({
      query: q,
      page,
      pageSize,
    });
  }

  @Get('/relations')
  async getRelations() {
    return await this.productMappingService.listRelations();
  }

  @Put('/relations')
  async upsertRelation(
    @Body() body: { shopifyId: string; parasutIds: string | string[] },
  ) {
    if (!body?.shopifyId) {
      throw new BadRequestException('shopifyId zorunlu');
    }
    return await this.productMappingService.upsertRelation(body);
  }

  @Delete('/relations/:shopifyId')
  async deleteRelation(@Param('shopifyId') shopifyId: string) {
    return await this.productMappingService.deleteRelation(shopifyId);
  }
}
