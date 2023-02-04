import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

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

  @Delete(':id')
  async deleteIngredient(@Param('id') id: number) {
    if (!id) throw new BadRequestException();
    return await this.ingredientService.delete(id);
  }
}
