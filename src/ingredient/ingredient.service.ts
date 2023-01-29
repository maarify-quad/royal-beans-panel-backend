import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { Ingredient } from './entities/ingredient.entity';

// DTOs
import { CreateIngredientsDto } from './dto/create-ingredients.dto';

@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
  ) {}

  async createMany(dto: CreateIngredientsDto) {
    return await this.ingredientRepo.save(dto.ingredients);
  }
}
