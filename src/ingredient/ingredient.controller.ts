import { Body, Controller, Post, UseGuards } from '@nestjs/common';

// Services
import { IngredientService } from './ingredient.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateIngredientsDto } from './dto/create-ingredients.dto';

@Controller('ingredients')
@UseGuards(JwtAuthGuard)
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Post()
  async createManyIngredients(@Body() dto: CreateIngredientsDto) {
    return await this.ingredientService.createMany(dto);
  }
}
