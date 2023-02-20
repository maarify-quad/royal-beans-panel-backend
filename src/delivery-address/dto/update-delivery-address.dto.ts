import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsString } from 'class-validator';

// DTOs
import { CreateDeliveryAddressDto } from './create-delivery-address.dto';

export class UpdateDeliveryAddressDto extends PartialType(
  CreateDeliveryAddressDto,
) {
  @IsNumber()
  id: number;

  @IsString()
  customerId: string;
}
