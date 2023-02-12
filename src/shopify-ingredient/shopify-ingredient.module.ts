import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { ShopifyIngredientController } from './shopify-ingredient.controller';

// Services
import { ShopifyIngredientService } from './shopify-ingredient.service';

// Entities
import { ShopifyIngredient } from './entities/shopify-ingredient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShopifyIngredient])],
  controllers: [ShopifyIngredientController],
  providers: [ShopifyIngredientService],
})
export class ShopifyIngredientModule {}
