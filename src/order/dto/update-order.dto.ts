import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';
import { Order } from '../entities/order.entity';

export class UpdateOrderDto extends PartialType(OmitType(Order, ['id'])) {
  @IsNumber()
  orderNumber: number;
}
