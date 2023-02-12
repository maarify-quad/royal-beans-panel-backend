import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
} from '@nestjs/common';

// Services
import { ShopifyIngredientService } from './shopify-ingredient.service';

// DTOs
import { CreateShopifyIngredientDto } from './dto/create-shopify-ingredient.dto';

@Controller('shopify_ingredients')
export class ShopifyIngredientController {
  constructor(
    private readonly shopifyIngredientService: ShopifyIngredientService,
  ) {}

  @Post()
  async create(@Body() dto: CreateShopifyIngredientDto) {
    return await this.shopifyIngredientService.create(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    if (!id) {
      throw new BadRequestException('Missing id');
    }

    return await this.shopifyIngredientService.deleteById(id);
  }
}
