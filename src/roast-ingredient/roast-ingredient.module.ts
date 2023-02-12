import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from 'src/product/product.module';

// Controllers
import { RoastIngredientController } from './roast-ingredient.controller';

// Services
import { RoastIngredientService } from './roast-ingredient.service';

// Entities
import { RoastIngredient } from './entities/roast-ingredient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoastIngredient]), ProductModule],
  controllers: [RoastIngredientController],
  providers: [RoastIngredientService],
  exports: [RoastIngredientService],
})
export class RoastIngredientModule {}
