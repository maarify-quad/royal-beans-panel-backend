import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';
import { Order } from '../entities/order.entity';

export class UpdateOrderDto extends PartialType(OmitType(Order, ['id'])) {
  @IsString()
  @IsNotEmpty()
  orderId: string;
}
