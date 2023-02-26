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
import { RoastIngredientService } from './roast-ingredient.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateRoastIngredientDto } from './dto/create-roast-ingredient.dto';

@Controller('roast_ingredients')
@UseGuards(JwtAuthGuard)
export class RoastIngredientController {
  constructor(
    private readonly roastIngredientService: RoastIngredientService,
  ) {}

  @Post()
  async createManyRoastIngredients(@Body() dto: CreateRoastIngredientDto) {
    return await this.roastIngredientService.createMany(dto);
  }

  @Delete(':id')
  async deleteRoastIngredient(@Param('id') id: number) {
    if (!id) {
      throw new BadRequestException();
    }

    return await this.roastIngredientService.deleteById(id);
  }
}
