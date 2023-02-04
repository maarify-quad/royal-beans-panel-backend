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
@UseGuards(JwtAuthGuard)
export class RoastController {
  constructor(private readonly roastService: RoastService) {}

  @Get()
  async getRoasts(@Query() query: GetRoastsDto) {
    // If no query is provided, return all roasts
    if (!query.limit && !query.page) {
      const roasts = await this.roastService.findAll();
      return { roasts, totalPages: 1, totalCount: roasts.length };
    }

    // Parse query params
    const limit = parseInt(query.limit || '25', 10);
    const page = parseInt(query.page || '1', 10);

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
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    // End response
    return { roasts, totalPages, totalCount };
  }

  @Get(':id')
  async getRoastById(@Param('id') id: string) {
    const roast = await this.roastService.findById(id);
    return { roast };
  }

  @Post()
  async createRoast(@Body() createRoastDto: CreateRoastDto) {
    return await this.roastService.createRoast(createRoastDto);
  }
}
