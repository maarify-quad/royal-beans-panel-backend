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

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => CreateOrderProductDto)
  orderProducts: OrderProduct[];
}
