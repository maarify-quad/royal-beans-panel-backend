import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// Entities
import { OrderProduct } from 'src/order-product/entities/order-product.entity';

// DTOs
import { CreateOrderProductDto } from 'src/order-product/dto/create-order-product.dto';
import { OrderSource } from '../entities/order.entity';

export class CreateOrderDto {
  @IsString()
  customerId: string;

  @IsDateString()
  deliveryDate: string;

  @IsString()
  @IsOptional()
  specialNote?: string;

  @IsNumber()
  @IsOptional()
  deliveryAddressId: number;

  @IsString()
  @IsNotEmpty()
  deliveryType: string;

  @IsString()
  @IsOptional()
  source?: OrderSource = 'dashboard';

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => CreateOrderProductDto)
  orderProducts: OrderProduct[];
}
