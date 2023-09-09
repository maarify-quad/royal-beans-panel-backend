import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

// Services
import { DeciService } from './deci.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateDeciDTO } from './dto/create-deci.dto';
import { UpdateDeciDTO } from './dto/update-deci.dto';

@Controller('decis')
@UseGuards(JwtAuthGuard)
export class DeciController {
  constructor(private readonly deciService: DeciService) {}

  @Get()
  async findAll() {
    return await this.deciService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateDeciDTO) {
    const existingDeci = await this.deciService.findOne({
      where: { value: dto.value },
    });
    if (existingDeci) {
      throw new BadRequestException('Bu desi zaten var');
    }

    return await this.deciService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDeciDTO,
  ) {
    return await this.deciService.update(id, dto);
  }
}
