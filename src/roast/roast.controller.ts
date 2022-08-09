import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

// Services
import { RoastService } from './roast.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateRoastDto } from './dto/create-roast.dto';

@Controller('roasts')
export class RoastController {
  constructor(private readonly roastService: RoastService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getRoasts() {
    const roasts = await this.roastService.findAll();
    return { roasts };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getRoastById(@Param('id') id: string) {
    const roast = await this.roastService.findById(id);
    return { roast };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRoast(@Body() createRoastDto: CreateRoastDto) {
    return await this.roastService.createRoast(createRoastDto);
  }
}
