import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

// Services
import { DeliveryAddressService } from './delivery-address.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateDeliveryAddressDto } from './dto/create-delivery-address.dto';
import { UpdateDeliveryAddressDto } from './dto/update-delivery-address.dto';

@Controller('delivery_addresses')
@UseGuards(JwtAuthGuard)
export class DeliveryAddressController {
  constructor(
    private readonly deliveryAddressService: DeliveryAddressService,
  ) {}

  @Post()
  async create(@Body() dto: CreateDeliveryAddressDto) {
    return await this.deliveryAddressService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateDeliveryAddressDto) {
    if (id !== dto.id) {
      throw new BadRequestException('id mismatch');
    }

    return await this.deliveryAddressService.update(dto);
  }

  @Delete(':id')
  async deleteById(@Param('id') id: number) {
    if (!id) {
      throw new BadRequestException('id is required');
    }

    return await this.deliveryAddressService.deleteById(id);
  }
}
