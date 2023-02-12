import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { ShopifyIngredient } from './entities/shopify-ingredient.entity';

// DTOs
import { CreateShopifyIngredientDto } from './dto/create-shopify-ingredient.dto';

@Injectable()
export class ShopifyIngredientService {
  constructor(
    @InjectRepository(ShopifyIngredient)
    private readonly shopifyIngredientRepo: Repository<ShopifyIngredient>,
  ) {}

  async create(dto: CreateShopifyIngredientDto) {
    return await this.shopifyIngredientRepo.save(dto);
  }

  async deleteById(id: number) {
    return await this.shopifyIngredientRepo.delete(id);
  }
}
