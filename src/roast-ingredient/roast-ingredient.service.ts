import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Services
import { ProductService } from 'src/product/product.service';

// Entities
import { RoastIngredient } from './entities/roast-ingredient.entity';

// DTOs
import { CreateRoastIngredientDto } from './dto/create-roast-ingredient.dto';

@Injectable()
export class RoastIngredientService {
  constructor(
    @InjectRepository(RoastIngredient)
    private readonly roastIngredientRepo: Repository<RoastIngredient>,
    private readonly productService: ProductService,
  ) {}

  async createMany(dto: CreateRoastIngredientDto) {
    return await this.roastIngredientRepo.save(dto.roastIngredients);
  }

  async deleteById(id: number) {
    return await this.roastIngredientRepo.delete(id);
  }

  async processRoast(
    productId: number,
    inputAmount: number,
    outputAmount: number,
  ) {
    const ingredients = await this.roastIngredientRepo.find({
      where: { productId },
      relations: { product: true, ingredient: true },
    });

    if (ingredients.length > 0) {
      await this.productService.incrementAmount(
        ingredients[0].productId,
        outputAmount,
      );
    }

    try {
      await Promise.all(
        ingredients.map(async (ingredient) => {
          const decrementAmount = inputAmount * (ingredient.rate / 100);
          const unitCost = decrementAmount * ingredient.ingredient.unitCost;

          await this.productService.updateUnitCost(productId, unitCost);

          await this.productService.decrementAmount(
            ingredient.ingredientId,
            decrementAmount,
          );
        }),
      );
    } catch {}
  }
}
