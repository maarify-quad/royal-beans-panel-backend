import { Body, Controller, Post, UseGuards } from '@nestjs/common';

// Services
import { DeliveryAddressService } from './delivery-address.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateDeliveryAddressDto } from './dto/create-delivery-address.dto';

@Controller('delivery_addresses')
@UseGuards(JwtAuthGuard)
export class DeliveryAddressController {
  constructor(
    private readonly deliveryAddressService: DeliveryAddressService,
  ) {}

  @Post()
  async create(@Body() createDeliveryAddressDto: CreateDeliveryAddressDto) {
    console.log('createDeliveryAddressDto', createDeliveryAddressDto);

    return await this.deliveryAddressService.create(createDeliveryAddressDto);
  }
}
