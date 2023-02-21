import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// Entities
import { OrderProduct } from 'src/order-product/entities/order-product.entity';

// DTOs
import { CreateOrderProductDto } from 'src/order-product/dto/create-order-product.dto';
import { OrderSource } from '../entities/order.entity';

export class CreateManualOrderDto {
  @IsString()
  @IsNotEmpty()
  receiver: string;

  @IsString()
  @IsNotEmpty()
  receiverNeighborhood: string;

  @IsString()
  @IsNotEmpty()
  receiverAddress: string;

  @IsString()
  @IsNotEmpty()
  receiverCity: string;

  @IsString()
  @IsNotEmpty()
  receiverProvince: string;

  @IsString()
  @IsNotEmpty()
  receiverPhone: string;

  @IsEmpty()
  deliveryAddressId?: number;

  @IsString()
  @IsNotEmpty()
  manualInvoiceStatus: string;

  @IsString()
  @IsOptional()
  specialNote?: string;

  @IsString()
  @IsOptional()
  source?: OrderSource = 'dashboard';

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => CreateOrderProductDto)
  orderProducts: OrderProduct[];
}
