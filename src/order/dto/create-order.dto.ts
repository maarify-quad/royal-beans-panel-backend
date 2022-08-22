import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateOrderProductDto } from 'src/order-product/dto/create-order-product.dto';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';

export class CreateOrderDto {
  @IsString()
  customerId: string;

  @IsDateString()
  deliveryDate: string;

  @IsString()
  @IsOptional()
  specialNote?: string;

  @IsString()
  @IsNotEmpty()
  deliveryType: string;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => CreateOrderProductDto)
  orderProducts: OrderProduct[];
}
