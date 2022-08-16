import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

// Services
import { RoastService } from './roast.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateRoastDto } from './dto/create-roast.dto';
import { GetRoastsDto } from './dto/get-roasts.dto';

@Controller('roasts')
export class RoastController {
  constructor(private readonly roastService: RoastService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getRoasts(@Query() query?: GetRoastsDto) {
    // If no query is provided, return all roasts
    if (!query) {
      const roasts = await this.roastService.findAll();
      return { roasts };
    }

    // Parse query params
    const limit = parseInt(query.limit, 10) || 50;
    const page = parseInt(query.page, 10) || 1;

    // If query is provided, return roasts matching query
    const result = await this.roastService.findAndCount({
      take: limit,
      skip: limit * (page - 1),
      order: {
        id: 'DESC',
      },
    });

    // Return roasts and total count
    const roasts = result[0];
    const total: number = result[1];
    const totalPage = Math.ceil(total / limit);

    // End response
    return { roasts, totalPage };
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
